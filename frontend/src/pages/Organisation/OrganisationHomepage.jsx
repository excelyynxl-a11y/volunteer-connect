import React, { useEffect, useMemo } from "react";
import {
  CalendarDays,
  Clock3,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Activity,
  TrendingUp,
  Inbox,
  Plus,
  ChevronRight
} from "lucide-react";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime } from "../../lib/utils"; 
import "./Organisation.css";
import "../../components/OpportunityCard.css";

const OpportunityRow = ({ 
  opportunity, 
  onClick 
}) => {
  const id = opportunity._id;
  const date = opportunity.fixedDate || opportunity.startAt;
  const categories = opportunity.category || [];
  const displayTime = opportunity.startAt && opportunity.endAt
    ? `${formatTime(opportunity.startAt).toLowerCase()} - ${formatTime(opportunity.endAt).toLowerCase()}`
    : opportunity.timeFrame || "";

  // Normalize backend 'closed' or raw statuses to standard UI tokens
  const rawStatus = opportunity.status || "active";
  const currentStatus = rawStatus.toLowerCase() === "closed" ? "completed" : rawStatus.toLowerCase().replace(/\s+/g, '-');
  
  const isCancelled = currentStatus === "cancelled";
  const iconSize = isCancelled ? 12 : 14;

  return (
    <article 
      className={`org-home-opportunity-row org-home-tone-${currentStatus}`}
      onClick={() => onClick && onClick(id)}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        ...(isCancelled && { padding: "12px 16px", borderRadius: 14 })
      }}
    >
      <div 
        className="org-home-opportunity-date"
        style={isCancelled ? { width: 52, height: 52 } : {}}
      >
        <span 
          className="org-home-opportunity-day"
          style={isCancelled ? { fontSize: 18 } : {}}
        >
          {date ? new Date(date).getDate() : "-"}
        </span>
        <span className="org-home-opportunity-month">
          {date ? new Date(date).toLocaleDateString("en-GB", { month: "short" }) : ""}
        </span>
      </div>
      
      <div className="org-home-opportunity-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        
        <h4 style={{ margin: 0, fontSize: isCancelled ? 14 : 15, fontWeight: 700, color: '#1d2a32', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {opportunity.title}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span 
            className={`event-tag status-${currentStatus}`}
            style={{ position: 'static', margin: 0, fontSize: '10px', padding: '4px 8px', textTransform: 'uppercase', lineHeight: 1 }}
          >
            {opportunity.status}
          </span>
          
          {categories.map((cat, index) => (
             <span 
               key={index} 
               className="event-category-tag" 
               style={{ position: 'static', margin: 0, fontSize: '10px', padding: '4px 8px', textTransform: 'uppercase', lineHeight: 1 }}
             >
               {cat}
             </span>
          ))}
        </div>
        
        <p style={{ margin: 0, fontSize: isCancelled ? 12.5 : 13 }}>
          {opportunity.details}
        </p>
        
        <div className="org-home-opportunity-meta" style={{ marginTop: '2px' }}>
          {date && <span><CalendarDays size={iconSize} />{formatDate(date)}</span>}
          {displayTime && <span><Clock3 size={iconSize} />{displayTime}</span>}
        </div>
      </div>
      
      <button type="button" className="org-home-opportunity-action">
        <ChevronRight size={isCancelled ? 16 : 18} />
      </button>
    </article>
  );
};

const StatCard = ({ icon, label, value, accent, hint }) => (
  <div className={`org-home-stat-card org-home-stat-${accent}`}>
    <div className="org-home-stat-icon">
      {React.createElement(icon, { size: 20, strokeWidth: 2.2 })}
    </div>
    <div className="org-home-stat-body">
      <span className="org-home-stat-label">{label}</span>
      <strong className="org-home-stat-value">{value}</strong>
      {hint && <span className="org-home-stat-hint">{hint}</span>}
    </div>
  </div>
);

const OrganisationHomepage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const {
    activeOpportunities,
    closedOpportunities,
    cancelledOpportunities,
    getMyOpportunities,
  } = useOrganisationStore();

  useEffect(() => {
    if (authUser?._id) {
      getMyOpportunities();
    }
  }, [authUser?._id, getMyOpportunities]);

  const orgName = authUser?.name || "Organisation";
  
  const nextOpportunity = useMemo(() => {
    if (!activeOpportunities?.length) return null;
    return [...activeOpportunities].sort(
      (a, b) => new Date(a.fixedDate || a.startAt) - new Date(b.fixedDate || b.startAt)
    )[0];
  }, [activeOpportunities]);

  const totals = useMemo(() => ({
    active: activeOpportunities?.length || 0,
    closed: closedOpportunities?.length || 0,
    cancelled: cancelledOpportunities?.length || 0,
  }), [activeOpportunities, closedOpportunities, cancelledOpportunities]);

  const completionRate = useMemo(() => {
    const total = totals.active + totals.closed + totals.cancelled;
    if (!total) return 0;
    return Math.round((totals.closed / total) * 100);
  }, [totals]);

  const nextDate = nextOpportunity ? nextOpportunity.fixedDate || nextOpportunity.startAt : null;
  const nextDisplayTime = nextOpportunity?.startAt && nextOpportunity?.endAt
    ? `${formatTime(nextOpportunity.startAt).toLowerCase()} - ${formatTime(nextOpportunity.endAt).toLowerCase()}`
    : nextOpportunity?.timeFrame || "";

  return (
    <div className="org-profile-page">
        <section className="org-home-hero">
          <div className="org-home-hero-left">
            <span className="organisation-section-label">ORGANISATION OVERVIEW</span>
            <h1>Welcome back, <span className="org-home-hero-name">{orgName}</span></h1>
            <p className="org-home-hero-description">
              A real-time pulse of every opportunity, applicant and engagement you've created. Keep your community moving beautifully.
            </p>
            <div className="org-home-hero-actions">
              <button
                type="button"
                className="organisation-create-btn"
                onClick={() => navigate("/organisation-dashboard/create-opportunity")}
              >
                <Plus size={16} /> Create New Posting
              </button>
            </div>
          </div>

          <div className="org-home-hero-card">
            <div className="org-home-hero-card-head">
              <span className="org-home-hero-card-eyebrow">Next event</span>
              <div style={{display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap'}}>
                <span 
                  className="event-tag status-active"
                  style={{ position: 'static', margin: 0, fontSize: '10px', padding: '4px 8px', textTransform: 'uppercase', lineHeight: 1 }}
                >
                  {nextOpportunity ? "Upcoming" : "None"}
                </span>
                {nextOpportunity?.category?.map((cat, i) => (
                    <span 
                      key={i} 
                      className="event-category-tag"
                      style={{ position: 'static', margin: 0, fontSize: '10px', padding: '4px 8px', textTransform: 'uppercase', lineHeight: 1 }}
                    >
                      {cat}
                    </span>
                ))}
              </div>
            </div>
            {nextOpportunity ? (
              <>
                <h3>{nextOpportunity.title}</h3>
                <p>{nextOpportunity.detail || nextOpportunity.details}</p>
                <div className="org-home-hero-card-meta">
                  {nextDate && <span><CalendarDays size={14} />{formatDate(nextDate)}</span>}
                  {nextDisplayTime && <span><Clock3 size={14} />{nextDisplayTime}</span>}
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

        <section className="org-home-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <StatCard icon={Activity} label="Active" value={totals.active} accent="emerald" hint="Currently open" />
          <StatCard icon={CheckCircle2} label="Completed" value={totals.closed} accent="gold" hint="Successfully delivered" />
          <StatCard icon={XCircle} label="Cancelled" value={totals.cancelled} accent="rose" hint="No longer running" />
        </section>
          
        <section className="org-home-split">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="org-home-panel">
              <header className="org-home-panel-head">
                <div>
                  <span className="organisation-section-label"><Activity size={12} /> ACTIVE OPPORTUNITIES</span>
                  <h2>Live right now</h2>
                </div>
                <button 
                  type="button" 
                  className="org-home-link"
                  onClick={() => navigate("/organisation-dashboard/opportunities")}
                >
                  View all <ArrowUpRight size={14} />
                </button>
              </header>

              <div className="org-home-opportunity-list">
                {activeOpportunities?.length ? (
                  activeOpportunities.slice(0, 4).map((opp) => (
                    <OpportunityRow 
                      key={opp._id} 
                      opportunity={opp} 
                      onClick={(id) => navigate(`/organisation-dashboard/view-opportunity/${id}`)}
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

            {cancelledOpportunities?.length > 0 && (
              <div className="org-home-panel">
                <header className="org-home-panel-head" style={{ marginBottom: 14 }}>
                  <div>
                    <span className="organisation-section-label"><XCircle size={12} /> CANCELLED</span>
                    <h3 style={{ margin: "8px 0 0", fontSize: 17 }}>Recently cancelled</h3>
                  </div>
                </header>
                <div className="org-home-opportunity-list" style={{ gap: 8 }}>
                  {cancelledOpportunities.slice(0, 3).map((opp) => (
                    <OpportunityRow 
                      key={opp._id} 
                      opportunity={opp}
                      onClick={(id) => navigate(`/organisation-dashboard/view-opportunity/${id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="org-home-side">
            <div className="org-home-panel org-home-panel-compact">
              <header className="org-home-panel-head">
                <div>
                  <span className="organisation-section-label"><TrendingUp size={12} /> COMPLETION</span>
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
                      strokeDasharray:  2 * Math.PI * 52,
                      strokeDashoffset: 2 * Math.PI * 52 * (1 - completionRate / 100),
                    }}
                  />
                </svg>
                <div className="org-home-ring-center">
                  <strong>{completionRate}%</strong>
                  <span>completed</span>
                </div>
              </div>
              <div className="org-home-ring-legend">
                <span><em className="org-home-dot org-home-dot-emerald" /> Active {totals.active}</span>
                <span><em className="org-home-dot org-home-dot-gold"    /> Closed {totals.closed}</span>
                <span><em className="org-home-dot org-home-dot-rose"    /> Cancelled {totals.cancelled}</span>
              </div>
            </div>

            <div className="org-home-panel org-home-panel-compact">
              <header className="org-home-panel-head">
                <div>
                  <span className="organisation-section-label"><CheckCircle2 size={12} /> RECENTLY CLOSED</span>
                  <h3>Wrapped up</h3>
                </div>
              </header>
              <div className="org-home-opportunity-list compact">
                {closedOpportunities?.length ? (
                  closedOpportunities.slice(0, 2).map((opp) => (
                    <OpportunityRow 
                      key={opp._id} 
                      opportunity={opp} 
                      onClick={(id) => navigate(`/organisation-dashboard/view-opportunity/${id}`)}
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
    </div>
  );
};

export default OrganisationHomepage;
