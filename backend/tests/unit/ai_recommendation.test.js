import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  gemini: vi.fn(),
  findVolunteer: vi.fn(),
  saveAnalysis: vi.fn(),
  getAnalysis: vi.fn(),
  appliedIds: vi.fn(),
  findOpportunities: vi.fn(),
  trigger: vi.fn(),
}));
vi.mock('../../src/lib/gemini.js', () => ({
  generateStructuredContent: mocks.gemini,
  GeminiError: class GeminiError extends Error { constructor(message, code) { super(message); this.code = code; } },
}));
vi.mock('../../src/models/user.model.js', () => ({ Volunteer: { findOne: mocks.findVolunteer } }));
vi.mock('../../src/models/volunteerAnalysis.model.js', () => ({
  default: { findOne: mocks.getAnalysis, findOneAndUpdate: mocks.saveAnalysis },
  ANALYSIS_LIMITS: { skills: { maxItems: 10, maxLength: 100 }, experience: { maxItems: 10, maxLength: 100 }, interests: { maxItems: 10, maxLength: 100 }, categories: { maxItems: 10 }, explanationMaxLength: 500 },
}));
vi.mock('../../src/models/application.model.js', () => ({ default: { distinct: mocks.appliedIds } }));
vi.mock('../../src/models/opportunity.model.js', () => ({
  default: { find: mocks.findOpportunities },
  OPPORTUNITY_CATEGORIES: ['Community', 'Environment', 'Education', 'Health', 'Elderly Care', 'Event Support', 'Other'],
}));
vi.mock('../../src/lib/analysisTrigger.js', () => ({ triggerVolunteerAnalysis: mocks.trigger }));

import { analyseVolunteer } from '../../src/services/volunteerAnalysis.service.js';
import { findCandidateOpportunities, getOpportunityRecommendations } from '../../src/services/opportunityRecommendation.service.js';

const volunteer = (availability = []) => ({ _id: 'volunteer-1', availability });
const slot = (dayOfWeek, startTime, endTime) => ({ dayOfWeek, startTime, endTime, preference: 'available' });
const event = (id, startAt = '2099-07-21T02:00:00.000Z', endAt = '2099-07-21T06:00:00.000Z') => ({
  _id: id, title: `Event ${id}`, details: 'Help neighbours', category: ['Community'],
  startAt: new Date(startAt), endAt: new Date(endAt),
  applicationDeadline: new Date('2099-07-20T00:00:00.000Z'),
  maxVolunteers: 10, approvedVolunteersCount: 0, status: 'active', deletedAt: null,
  organisationId: { name: 'Helping Hands' },
});
const analysis = { status: 'ready', skills: ['Communication'], experience: [], interests: [], categories: ['Community'], explanation: 'Based on your communication skills, we recommend exploring Community opportunities.' };
const query = (result) => {
  const q = { sort: vi.fn(), limit: vi.fn(), populate: vi.fn(), select: vi.fn(), lean: vi.fn() };
  for (const name of ['sort', 'limit', 'populate', 'select']) q[name].mockReturnValue(q);
  q.lean.mockResolvedValue(result);
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.appliedIds.mockResolvedValue([]);
  mocks.getAnalysis.mockReturnValue({ lean: vi.fn().mockResolvedValue(analysis) });
  mocks.findOpportunities.mockImplementation(() => query([]));
  mocks.saveAnalysis.mockImplementation((_filter, update) => ({ lean: vi.fn().mockResolvedValue(update.$set) }));
});

describe('AI recommendation priority backend tests', () => {
  it('AI-001 analyses both profile and valid PDF resume', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => Uint8Array.from(Buffer.from('%PDF-1.7 test document')).buffer });
    try {
      mocks.findVolunteer.mockReturnValue(query({ biodata: 'Community volunteer', skills: ['Communication'], resume: 'https://example.com/resume.pdf', updatedAt: new Date() }));
      mocks.gemini.mockResolvedValue({ skills: ['Communication'], experience: [], interests: ['Helping people'], categories: ['Community'], explanation: analysis.explanation });
      const result = await analyseVolunteer('volunteer-1');
      expect(mocks.gemini).toHaveBeenCalledWith(expect.objectContaining({ files: [expect.objectContaining({ mimeType: 'application/pdf' })] }));
      expect(result.resumeUsed).toBe(true);
      expect(result.categories).toContain('Community');
    } finally { globalThis.fetch = originalFetch; }
  });

  it('AI-002 analyses profile without a resume', async () => {
    mocks.findVolunteer.mockReturnValue(query({ biodata: 'I enjoy community work', skills: ['Communication'], resume: null, updatedAt: new Date() }));
    mocks.gemini.mockResolvedValue({ skills: ['Communication'], experience: [], interests: [], categories: ['Community'], explanation: analysis.explanation });
    const result = await analyseVolunteer('volunteer-1');
    expect(mocks.gemini).toHaveBeenCalledWith(expect.objectContaining({ files: [] }));
    expect(result.resumeUsed).toBe(false);
  });

  it('AI-006 does not restrict eligible candidates when availability is empty', async () => {
    mocks.findOpportunities.mockReturnValue(query([event('a'), event('b')]));
    expect(await findCandidateOpportunities(volunteer(), ['Community'])).toHaveLength(2);
  });

  it('AI-007 keeps an event fully inside Tuesday availability', async () => {
    mocks.findOpportunities.mockReturnValue(query([event('a')]));
    expect(await findCandidateOpportunities(volunteer([slot('Tuesday', '09:00', '17:00')]), ['Community'])).toHaveLength(1);
  });

  it('AI-008 rejects an event with only partial availability overlap', async () => {
    mocks.findOpportunities.mockReturnValue(query([event('a')]));
    expect(await findCandidateOpportunities(volunteer([slot('Tuesday', '09:00', '12:00')]), ['Community'])).toHaveLength(0);
  });

  it('AI-010 rejects multi-day events with availability configured', async () => {
    mocks.findOpportunities.mockReturnValue(query([event('a', '2099-07-21T02:00:00Z', '2099-07-22T06:00:00Z')]));
    expect(await findCandidateOpportunities(volunteer([slot('Tuesday', '00:00', '23:59')]), ['Community'])).toHaveLength(0);
  });

  it('AI-012 queries only active, upcoming, unfilled and non-deleted opportunities', async () => {
    await findCandidateOpportunities(volunteer(), ['Community']);
    expect(mocks.findOpportunities).toHaveBeenCalledWith(expect.objectContaining({
      status: 'active', deletedAt: null,
      startAt: { $gt: expect.any(Date) },
      applicationDeadline: { $gt: expect.any(Date) },
      $expr: { $lt: ['$approvedVolunteersCount', '$maxVolunteers'] },
    }));
  });

  it('AI-013 excludes every previously applied opportunity ID in the query', async () => {
    mocks.appliedIds.mockResolvedValue(['withdrawn-id', 'rejected-id']);
    await findCandidateOpportunities(volunteer(), ['Community']);
    expect(mocks.appliedIds).toHaveBeenCalledWith('opportunityId', { volunteerId: 'volunteer-1' });
    expect(mocks.findOpportunities).toHaveBeenCalledWith(expect.objectContaining({ _id: { $nin: ['withdrawn-id', 'rejected-id'] } }));
  });

  it('AI-015 selects suitable candidates and preserves Gemini ranking', async () => {
    const a = event('a'); const b = event('b');
    mocks.findOpportunities.mockImplementation((filter) => query(filter._id?.$in ? [a, b] : [a, b]));
    mocks.gemini.mockResolvedValue({ opportunityIds: ['b', 'a'] });
    const result = await getOpportunityRecommendations(volunteer());
    expect(result.status).toBe('ok');
    expect(result.opportunities.map((item) => item._id)).toEqual(['b', 'a']);
    expect(result.explanation).toBe(analysis.explanation);
  });

  it('AI-020 returns ai_unavailable when Gemini fails', async () => {
    mocks.findOpportunities.mockReturnValue(query([event('a')]));
    const { GeminiError } = await import('../../src/lib/gemini.js');
    mocks.gemini.mockRejectedValue(new GeminiError('Service unavailable', 'SERVICE_ERROR'));
    const result = await getOpportunityRecommendations(volunteer());
    expect(result.status).toBe('ai_unavailable');
    expect(result.opportunities).toEqual([]);
  });
});
