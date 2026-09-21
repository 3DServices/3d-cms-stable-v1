/**
 * Two-column panel: Maintenance & Compliance Queue + Waswa AI Proactive Insights.
 */
import React from 'react';
import { WaswaAskChips, WaswaSampleTag } from '../../../components/waswa';
import { COLORS, btn, btnPrimary, btnBlue } from './types';
import { Pill, SectionTitle } from './MetricCard';

const MAINTENANCE_ITEMS = [
  { n: '12', t: 'Overdue service (km/hours)', d: 'KLA-TRUCK-014 • 9 days overdue',       sev: '🟠' },
  { n: '7',  t: 'Expired documents',          d: 'NBO-BODA-PIKI-044 • Insurance expired', sev: '🔴' },
  { n: '23', t: 'Docs expiring soon',         d: 'Fleet-wide • 30d window',               sev: '🟡' },
  { n: '5',  t: 'Unassigned drivers',         d: 'Trips missing driver attribution',      sev: '🟡' },
];

export function MaintenancePanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 14, marginTop: 14 }}>
      {/* Maintenance & Compliance Queue */}
      <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
        <SectionTitle
          title="Maintenance & Compliance Queue"
          subtitle="HIC required for immobilize, suspension, bulk export"
          right={<Pill bg="#fff" fg={COLORS.blue}>Open Planner</Pill>}
        />
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {MAINTENANCE_ITEMS.map((it) => (
            <div key={it.t} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pill bg="#F0FBF9" fg={COLORS.tealDark}>{it.n}</Pill>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 12 }}>{it.t}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{it.d}</div>
                </div>
              </div>
              <Pill bg={it.sev === '🔴' ? COLORS.danger : it.sev === '🟠' ? '#F97316' : COLORS.warning} fg="#fff">
                {it.sev}
              </Pill>
            </div>
          ))}
        </div>
      </div>

      {/* Waswa AI — Proactive Insights (inline summary card, not the floating drawer) */}
      <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
        <SectionTitle
          title="Waswa AI — Proactive Insights"
          subtitle="Human-in-Control • suggestions require approval"
          right={<WaswaSampleTag />}
        />
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 10 }}>
            <WaswaAskChips prompts={["How are maintenance schedules set?", "What documents must a vehicle keep valid?"]} />
          </div>
          <div style={{ background: '#E6F4FE', borderRadius: 14, padding: 10, border: `1px solid ${COLORS.border}`, marginBottom: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 12 }}>Detected revenue leakage risk in VEBA Boda sector.</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
              12 hirers viewed contact unlock but no escrow → flag for review.
            </div>
            <div style={{ marginTop: 8 }}>
              <button style={{ ...btn, ...btnBlue }} onClick={() => console.log('open leakage queue')}>Open Leakage Queue</button>
            </div>
          </div>
          <div style={{ background: '#E8F5F3', borderRadius: 14, padding: 10, border: `1px solid ${COLORS.border}`, marginLeft: 30 }}>
            <div style={{ fontWeight: 900, fontSize: 12 }}>Suggested action (HITL):</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
              Enable "Contact Gating" + require Type‑B tokens to reveal phone.
            </div>
            <div style={{ marginTop: 8 }}>
              <button style={{ ...btn, ...btnPrimary }} onClick={() => console.log('review & approve')}>Review & Approve</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
