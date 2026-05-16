import React, { useEffect, useMemo } from "react";
import {Sparkles,CalendarDays,Clock3,ArrowUpRight,Plus,Users,CheckCircle2,XCircle,Activity,TrendingUp,Inbox,ChevronRight,} 
from "lucide-react";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import { useAuthStore } from "../../store/useAuthStore";
const formatDate = (value) => {
  if (!value) return "TBD";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
};
const StatCard = ({ icon: Icon, label, value, accent, hint }) => (
  <div className={`org-home-stat-card org-home-stat-${accent}`}>
    <div className="org-home-stat-icon">
      <Icon size={20} strokeWidth={2.2} />
    </div>
    <div className="org-home-stat-body">
      <span className="org-home-stat-label">{label}</span>
      <strong className="org-home-stat-value">{value}</strong>
      {hint && <span className="org-home-stat-hint">{hint}</span>}
    </div>
  </div>
);
const OpportunityRow = ({ opportunity, tone = "active" }) => (
  <article className={`org-home-opportunity-row org-home-tone-${tone}`}>
    <div className="org-home-opportunity-date">
      <span className="org-home-opportunity-day">
        {opportunity.fixedDate
          ? new Date(opportunity.fixedDate).getDate()
          : "—"}
      </span>
      <span className="org-home-opportunity-month">
        {opportunity.fixedDate
          ? new Date(opportunity.fixedDate).toLocaleDateString("en-GB", {
              month: "short",
            })
          : "TBD"}
      </span>
    </div>
    <div className="org-home-opportunity-body">
      <div className="org-home-opportunity-head">
        <h4>{opportunity.title}</h4>
        <span className={`org-home-pill org-home-pill-${tone}`}>
          {opportunity.status}
        </span>
      </div>
      <p>{opportunity.detail || opportunity.details}</p>
      <div className="org-home-opportunity-meta">
        <span>
          <CalendarDays size={14} />
          {formatDate(opportunity.fixedDate)}
        </span>
        <span>
          <Clock3 size={14} />
          {opportunity.timeFrame || "Flexible"}
        </span>
      </div>
    </div>
    <button type="button" className="org-home-opportunity-action" aria-label="View">
      <ChevronRight size={18} />
    </button>
  </article>
);
const OrganisationHomePage = () => {
  const authUser = useAuthStore((s) => s.authUser);
  const {
    activeOpportunities,
    closedOpportunities,
    cancelledOpportunities,
    pendingApplications,
    approvedApplications,
    getActiveOpportunities,
    getClosedOpportunities,
    getCancelledOpportunities,
  } = useOrganisationStore();
  useEffect(() => {
    getActiveOpportunities();
    getClosedOpportunities();
    getCancelledOpportunities();
  }, [getActiveOpportunities, getClosedOpportunities, getCancelledOpportunities]);
  const orgName =
    authUser?.organisationName || authUser?.fullName || "Organisation";
  const nextOpportunity = useMemo(() => {
    if (!activeOpportunities?.length) return null;
    return [...activeOpportunities].sort(
      (a, b) => new Date(a.fixedDate) - new Date(b.fixedDate),
    )[0];
  }, [activeOpportunities]);
  const totals = {
    active: activeOpportunities?.length || 0,
    closed: closedOpportunities?.length || 0,
    cancelled: cancelledOpportunities?.length || 0,
    pending: pendingApplications?.length || 0,
    approved: approvedApplications?.length || 0,
  };
  const completionRate = useMemo(() => {
    const total = totals.active + totals.closed + totals.cancelled;
    if (!total) return 0;
    return Math.round((totals.closed / total) * 100);
  }, [totals]);
  return (
    <div className="org-home-page">
      {/* Hero */}
      <section className="org-home-hero">
        <div className="org-home-hero-left">
          <span className="organisation-section-label">
            <Sparkles size={12} /> ORGANISATION OVERVIEW
          </span>
          <h1>
            Welcome back, <span className="org-home-hero-name">{orgName}</span>
          </h1>
          <p className="org-home-hero-description">
            A real-time pulse of every opportunity, applicant and engagement
            you've created. Keep your community moving — beautifully.
          </p>

        </div>
        <div className="org-home-hero-card">
          <div className="org-home-hero-card-head">
            <span className="org-home-hero-card-eyebrow">Next event</span>
            <span className={`org-home-pill org-home-pill-active`}>
              {nextOpportunity ? "Upcoming" : "None"}
            </span>
          </div>
          {nextOpportunity ? (
            <>
              <h3>{nextOpportunity.title}</h3>
              <p>{nextOpportunity.detail}</p>
              <div className="org-home-hero-card-meta">
                <span>
                  <CalendarDays size={14} />
                  {formatDate(nextOpportunity.fixedDate)}
                </span>
                <span>
                  <Clock3 size={14} />
                  {nextOpportunity.timeFrame}
                </span>
              </div>
            </>
          ) : (
            <div className="org-home-empty-mini">
              <Inbox size={28} />
              <p>No upcoming opportunities yet.</p>
            </div>
          )}
        </div>
      </section>
      {/* Stats */}
      <section className="org-home-stats-grid">
        <StatCard
          icon={Activity}
          label="Active"
          value={totals.active}
          accent="emerald"
          hint="Currently open"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={totals.closed}
          accent="gold"
          hint="Successfully delivered"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled"
          value={totals.cancelled}
          accent="rose"
          hint="No longer running"
        />
      </section>
      {/* Two column: Opportunities + Snapshot */}
      <section className="org-home-split">
        <div className="org-home-panel">
          <header className="org-home-panel-head">
            <div>
              <span className="organisation-section-label">
                <Activity size={12} /> ACTIVE OPPORTUNITIES
              </span>
              <h2>Live right now</h2>
            </div>
            <button type="button" className="org-home-link">
              View all <ArrowUpRight size={14} />
            </button>
          </header>
          <div className="org-home-opportunity-list">
            {activeOpportunities?.length ? (
              activeOpportunities
                .slice(0, 4)
                .map((o) => (
                  <OpportunityRow
                    key={o._id}
                    opportunity={o}
                    tone="active"
                  />
                ))
            ) : (
              <div className="org-home-empty">
                <Inbox size={32} />
                <p>No active opportunities. Create one to get started.</p>
              </div>
            )}
          </div>
        </div>
        <aside className="org-home-side">
          <div className="org-home-panel org-home-panel-compact">
            <header className="org-home-panel-head">
              <div>
                <span className="organisation-section-label">
                  <TrendingUp size={12} /> COMPLETION
                </span>
                <h3>Delivery rate</h3>
              </div>
            </header>
            <div className="org-home-ring">
              <svg viewBox="0 0 120 120" className="org-home-ring-svg">
                <circle cx="60" cy="60" r="52" className="org-home-ring-track" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="org-home-ring-bar"
                  style={{
                    strokeDasharray: 2 * Math.PI * 52,
                    strokeDashoffset:
                      2 * Math.PI * 52 * (1 - completionRate / 100),
                  }}
                />
              </svg>
              <div className="org-home-ring-center">
                <strong>{completionRate}%</strong>
                <span>completed</span>
              </div>
            </div>
            <div className="org-home-ring-legend">
              <span>
                <em className="org-home-dot org-home-dot-emerald" /> Active{" "}
                {totals.active}
              </span>
              <span>
                <em className="org-home-dot org-home-dot-gold" /> Closed{" "}
                {totals.closed}
              </span>
              <span>
                <em className="org-home-dot org-home-dot-rose" /> Cancelled{" "}
                {totals.cancelled}
              </span>
            </div>
          </div>
          <div className="org-home-panel org-home-panel-compact">
            <header className="org-home-panel-head">
              <div>
                <span className="organisation-section-label">
                  <CheckCircle2 size={12} /> RECENTLY CLOSED
                </span>
                <h3>Wrapped up</h3>
              </div>
            </header>
            <div className="org-home-opportunity-list compact">
              {closedOpportunities?.length ? (
                closedOpportunities
                  .slice(0, 2)
                  .map((o) => (
                    <OpportunityRow
                      key={o._id}
                      opportunity={o}
                      tone="closed"
                    />
                  ))
              ) : (
                <div className="org-home-empty">
                  <p>Nothing closed yet.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>
      {/* Cancelled row */}
      {cancelledOpportunities?.length > 0 && (
        <section className="org-home-panel">
          <header className="org-home-panel-head">
            <div>
              <span className="organisation-section-label">
                <XCircle size={12} /> CANCELLED
              </span>
              <h2>Recently cancelled</h2>
            </div>
          </header>
          <div className="org-home-opportunity-list">
            {cancelledOpportunities.slice(0, 3).map((o) => (
              <OpportunityRow key={o._id} opportunity={o} tone="cancelled" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
export default OrganisationHomePage;