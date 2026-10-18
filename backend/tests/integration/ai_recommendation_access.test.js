import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

const mocks = vi.hoisted(() => ({ verify: vi.fn(), findUser: vi.fn(), recommend: vi.fn(), getAnalysis: vi.fn() }));
vi.mock('jsonwebtoken', () => ({ default: { verify: mocks.verify } }));
vi.mock('../../src/models/user.model.js', () => ({ User: { findOne: mocks.findUser } }));
vi.mock('../../src/services/opportunityRecommendation.service.js', () => ({ getOpportunityRecommendations: mocks.recommend }));
vi.mock('../../src/services/volunteerAnalysis.service.js', () => ({ getVolunteerAnalysis: mocks.getAnalysis }));
import recommendationRouter from '../../src/routes/recommendation.route.js';
const app = express();
app.use(cookieParser());
app.use('/api/recommendations', recommendationRouter);
const userQuery = (user) => ({ select: vi.fn().mockResolvedValue(user) });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verify.mockReturnValue({ userId: 'test-volunteer' });
  mocks.findUser.mockReturnValue(userQuery({ _id: 'test-volunteer', role: 'volunteer', approvalStatus: 'approved' }));
  mocks.recommend.mockResolvedValue({ status: 'no_matches', explanation: '', opportunities: [] });
});

describe('Recommendation endpoint authorization and rate limit', () => {
  it('AI-027 blocks unauthenticated and non-volunteer requests', async () => {
    const anonymous = await request(app).post('/api/recommendations/opportunities');
    expect(anonymous.status).toBe(401);
    mocks.findUser.mockReturnValue(userQuery({ _id: 'test-admin', role: 'admin', approvalStatus: 'approved' }));
    const admin = await request(app).post('/api/recommendations/opportunities').set('Cookie', 'jwt=fake-token');
    expect(admin.status).toBe(403);
    expect(mocks.recommend).not.toHaveBeenCalled();
  });

  it('AI-028 responds with HTTP 429 after 10 requests from one volunteer within five minutes', async () => {
    // Each test uses a distinct test identity so the module-level rate limiter has no stale count.
    const identity = `quota-${Date.now()}`;
    mocks.verify.mockReturnValue({ userId: identity });
    mocks.findUser.mockReturnValue(userQuery({ _id: identity, role: 'volunteer', approvalStatus: 'approved' }));
    for (let i = 0; i < 10; i += 1) {
      const response = await request(app).post('/api/recommendations/opportunities').set('Cookie', 'jwt=fake-token');
      expect(response.status).toBe(200);
    }
    const blocked = await request(app).post('/api/recommendations/opportunities').set('Cookie', 'jwt=fake-token');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({ success: false });
    expect(mocks.recommend).toHaveBeenCalledTimes(10);
  });
});
