import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import RecommendedOpportunities from '../../src/pages/ai-recommendations/RecommendedOpportunities.jsx';

const example = {
  _id: 'opportunity-1',
  title: 'Community Food Drive Helper',
  details: 'Support food packing for families.',
  category: ['Community', 'Event Support'],
  location: 'Selangor, Cheras',
  organisationId: { name: 'Helping Hands Malaysia' },
  startAt: '2026-10-20T01:00:00.000Z',
  endAt: '2026-10-20T06:00:00.000Z',
  applicationDeadline: '2026-10-17T00:00:00.000Z',
  maxVolunteers: 20,
  approvedVolunteersCount: 1,
};

describe('AI recommendation card integration', () => {
  it('AI-022 displays recommended opportunity, explanation, separate category badges, and weekday', () => {
    render(<RecommendedOpportunities recommendations={[example]} insight="Recommended based on your community experience." />);
    expect(screen.getByText('Community Food Drive Helper')).toBeInTheDocument();
    expect(screen.getByText('Recommended based on your community experience.')).toBeInTheDocument();
    const card = screen.getByText('Community Food Drive Helper').closest('article');
    expect(within(card).getByText('Community')).toHaveClass('event-category-tag');
    expect(within(card).getByText('Event Support')).toHaveClass('event-category-tag');
    expect(within(card).getByText(/Tuesday, 20 Oct 2026/)).toBeInTheDocument();
    expect(within(card).getByText(/19 spots left/)).toBeInTheDocument();
  });

  it('AI-026 invokes View and Apply with the selected opportunity', () => {
    const onView = vi.fn(); const onApply = vi.fn();
    render(<RecommendedOpportunities recommendations={[example]} onView={onView} onApply={onApply} />);
    fireEvent.click(screen.getByRole('button', { name: 'View' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onView).toHaveBeenCalledWith(expect.objectContaining({ id: 'opportunity-1' }));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ id: 'opportunity-1' }));
  });
});
