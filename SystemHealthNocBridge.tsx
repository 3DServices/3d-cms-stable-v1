import React, { useMemo, useState } from "react";
import "./SystemHealthNocBridge.css";

type Severity = "green" | "warning" | "alarm" | "critical";
type HitlAction = {
  id: string;
  sev: Severity;
  title: string;
  reason: string;
  primaryCta: "Approve" | "HIC";
  secondaryCta: string;
};

const sevLabel: Record<Severity, string> = {
  green: "Active",
  warning: "Warning",
  alarm: "Alarm",
  critical: "Critical",
};

export default function SystemHealthNocBridge() {
  const [showTaskManager, setShowTaskManager] = useState(false);

  const hitl = useMemo<HitlAction[]>(
    () => [
      {
        id: "a1",
        sev: "alarm",
        title: "Scale Kafka consumer group +1",
        reason: "Lag 4.8s trending up • risk: ingest delay + token burn drift",
        primaryCta: "Approve",
        secondaryCta: "Review",
      },
      {
        id: "a2",
        sev: "warning",
        title: "Set token burn soft-cap (80%)",
        reason: "Tenant: OLIWA_CORP_UG • run-out <72h",
        primaryCta: "Approve",
        secondaryCta: "Edit",
      },
      {
        id: "a3",
        sev: "alarm",
        title: "Gate VEBA contact unlock",
        reason: "Leakage attempts 17 today (KLA_BODA_POOL)",
        primaryCta: "Approve",
        secondaryCta: "Simulate",
      },
      {
        id: "a4",
        sev: "critical",
        title: "Suspend webhook retries (Airtel UG)",
        reason: "Fail 6.7% • risk: paid-not-credited disputes",
        primaryCta: "HIC",
        secondaryCta: "Runbook",
      },
    ],
    []
  );

  return (
    <div className="nvas-root">
      <header className="topbar">
        <div className="brand">
          <span className="brandName">NAVAS v26</span>
          <span className="dot">•</span>
          <span className="pageTitle">NOC Bridge — System Health CMS</span>
        </div>

        <div className="search">
          <input placeholder="Search tenants, units, tokens, incidents…" />
        </div>

        <div className="rbac">
          <span className="pill teal">SYSADMIN</span>
          <span className="pill azure">can-spend</span>
          <div className="avatar">T</div>
          <div className="who">Tim • Kampala</div>
        </div>
      </header>

      <div className="strip">
        <div className="chips">
          <span className="chip">Scope: Dealer→Client→Org</span>
          <span className="chip">RBAC: SYSADMIN / Admin</span>
          <span className="chip">Wallet: UGX 8.6M • 1.24M Tok</span>
          <span className="chip">Burn: 1.7 Tok/s</span>
          <span className="chip">Run-out: ≈ 8.1 days</span>
          <span className="chip">Status: 🟢 Green • 99.82%</span>
          <span className="chip">Fresh: p95 22s • last msg 7s</span>
          <span className="chip">Alerts: P1:2  P2:11</span>
          <span className="chip">Pay: M-Pesa OK • MTN OK</span>
          <span className="chip">Waswa: ON • HITL 3</span>
          <span className="chip">Range: 24h</span>
          <span className="chip">Audit: ON • 89d</span>
        </div>
        <div className="stripActions">
          <button className="btn green">+ New</button>
          <button className="btn azure">Export</button>
        </div>
      </div>

      <div className="body">
        <nav className="navRail" aria-label="Primary navigation">
          {[
            ["Home", "H"],
            ["Health", "⛑"],
            ["Alarms", "!"],
            ["Tokens", "T"],
            ["Billing", "₿"],
            ["Payments", "$"],
            ["VEBA", "V"],
            ["AI", "W"],
            ["RBAC", "R"],
            ["Audit", "A"],
          ].map(([label, glyph]) => (
            <button
              key={label}
              className={`railBtn ${label === "Health" ? "active" : ""}`}
              title={label}
            >
              {glyph}
            </button>
          ))}
        </nav>

        <aside className="sidebar">
          <div className="sideTitle">System Health CMS</div>
          <div className="sideSub">SRE God View • Ops+Revenue</div>

          <div className="sideMenu">
            {[
              ["Overview", true],
              ["API & Edge", false],
              ["Ingestion Pipeline", false],
              ["Kafka", false],
              ["Databases", false],
              ["Compute", false],
              ["Messaging + Payments", false],
              ["AI Workloads", false],
              ["Task Manager (Diag)", false],
              ["Runbooks", false],
              ["Incidents", false],
            ].map(([label, active]) => (
              <div key={label} className={`sideItem ${active ? "active" : ""}`}>
                {label}
              </div>
            ))}
          </div>

          <div className="tip">
            <div className="tipTitle">Waswa Tip</div>
            <div className="tipBody">Type: “why burn↑” to trace token drains to infra.</div>
          </div>
        </aside>

        <main className="workspace">
          <section className="blade">
            <div className="bladeHeader">
              <div className="bladeTitle">System Health — God View</div>
              <div className="bladeMeta">refresh 30s</div>
            </div>

            <div className="bladeContent">
              <div className="grid2">
                <Kpi title="Uptime (30d)" value="99.82%" sub="p95 API 320ms • 5xx 0.7%" sev="green" />
                <Kpi title="Ingest p95" value="22s" sub="Drop est 0.04% • dup 0.21%" sev="warning" />
                <Kpi title="Kafka lag" value="4.8s" sub="URP 0 • brokers disk 61%" sev="green" />
                <Kpi title="Token Burn (ops)" value="1.7 Tok/s" sub="Retry storms +0.3 Tok/s" sev="alarm" />
              </div>

              <Card title="Compute & System Resource Usage" subtitle="Percentages (cluster)">
                <Bar label="CPU" pct={0.63} meta="63% (🟡>70 🟠>85 🔴>95)" />
                <Bar label="RAM Free" pct={0.18} meta="18% (🟡<20 🟠<10 🔴<5)" warn />
                <Bar label="Disk Free" pct={0.24} meta="24% (🟡<20 🟠<10 🔴<5)" />
                <Bar label="Net Errors" pct={0.07} meta="0.7% (🟡>1 🟠>3 🔴>5)" />
                <div className="cardRow">
                  <button className="btn azure" onClick={() => setShowTaskManager(true)}>
                    Open Task Manager
                  </button>
                </div>
              </Card>

              <Card title="Payments & Mobile Money Gateways" subtitle="Real-time status • webhook backlog">
                <div className="grid2 compact">
                  <MiniGateway name="M-Pesa KE" status="OK" meta="success 98.9% • p95 9.2s" sev="green" />
                  <MiniGateway name="MTN MoMo UG" status="OK" meta="success 97.6% • p95 11.4s" sev="green" />
                  <MiniGateway name="Airtel UG" status="DEGRADED" meta="success 91.2% • webhook fail 6.7%" sev="alarm" />
                  <MiniGateway name="Airtel KE" status="OK" meta="success 96.8% • settle delay 18m" sev="green" />
                </div>
                <div className="cardRow">
                  <button className="btn azure">View retries</button>
                  <button className="btn green">+ New webhook rule</button>
                  <button className="btn azure">Export recon</button>
                </div>
              </Card>

              <Card title="VEBA Governance • Leakage Prevention" subtitle="Listings + tendering + escrow">
                <div className="grid4">
                  <MiniStat label="Bookings today" value="184" />
                  <MiniStat label="Leakage attempts" value="17" />
                  <MiniStat label="Escrow balance" value="UGX 42.8M" />
                  <MiniStat label="Settlement p95" value="18m" />
                </div>
                <div className="table">
                  <div className="thead">
                    <div>Flag</div>
                    <div>Entity</div>
                    <div>Signal</div>
                    <div>Suggested action</div>
                    <div>⋮</div>
                  </div>
                  {[
                    ["🟠", "Boda Pool • Kampala", "contact share ×6", "Gate contacts → require token", "⋮"],
                    ["🟡", "D8 Dozer • Jinja", "cancel rate 23%", "Require deposit + KYC refresh", "⋮"],
                  ].map((r) => (
                    <div key={r[1]} className="trow">
                      {r.map((c, i) => (
                        <div key={i}>{c}</div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="cardRow">
                  <button className="btn azure">Open VEBA Ops</button>
                  <button className="btn green">+ New leakage rule</button>
                </div>
              </Card>
            </div>
          </section>

          <section className="blade aiBlade">
            <div className="bladeHeader greenAccent">
              <div className="bladeTitle">Waswa AI — Primary Driver</div>
              <div className="bladeMeta">HITL enforced</div>
            </div>

            <div className="bladeContent">
              <Card title="Waswa AI • Ops Co‑Pilot" subtitle="Proactive insights (Revenue + Health + Billing)">
                <div className="pillRow">
                  <span className="pill green">ON</span>
                  <span className="hint">System Health 99.82% • leakage risk (VEBA) • suggest 5k mint</span>
                </div>
                <div className="cardRow">
                  <button className="btn azure">Open HITL Queue</button>
                  <button className="btn teal">Ask why?</button>
                  <button className="btn ghost">Mute (1h)</button>
                </div>
              </Card>

              <Card title="HITL / HIC Pending Actions" subtitle="High-risk actions require approval + audit">
                <div className="hitl">
                  {hitl.map((a) => (
                    <div key={a.id} className="hitlRow">
                      <div className={`sev ${a.sev}`} title={sevLabel[a.sev]} />
                      <div className="hitlText">
                        <div className="hitlTitle">{a.title}</div>
                        <div className="hitlReason">{a.reason}</div>
                      </div>
                      <div className="hitlActions">
                        <button className={`btn ${a.primaryCta === "HIC" ? "red" : "green"}`}>
                          {a.primaryCta}
                        </button>
                        <button className="btn azure">{a.secondaryCta}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Ask Waswa (chat)" subtitle="Natural language ops • cost-aware answers (tokenized)">
                <div className="chat">
                  <div className="bubble mine">Why is token burn up today?</div>
                  <div className="bubble">
                    Root cause: 1) Airtel UG retries (+0.18 Tok/s), 2) SSE clients surge (+0.11 Tok/s), 3) Kafka
                    replays (+0.06 Tok/s). Recommend: backoff + per-tenant caps.
                  </div>
                  <div className="bubble mine">Create an 80% burn alert + WhatsApp notify.</div>
                  <div className="bubble">
                    Draft created (HITL). Impact: +0.02 Tok/s for notifications. Approve to activate for OLIWA_CORP_UG,
                    PIKI_KLA_POOL.
                  </div>
                </div>
                <div className="chatInput">
                  <input placeholder="Tell Waswa to…" />
                  <button className="send">➤</button>
                </div>
              </Card>
            </div>
          </section>
        </main>
      </div>

      <footer className="footer">
        Kafka lag 4.8s • Redis p95 3ms • Cassandra p95 27ms • SSE clients 2.1k • Uptime 99.82%
      </footer>

      {showTaskManager ? (
        <TaskManagerModal onClose={() => setShowTaskManager(false)} />
      ) : null}
    </div>
  );
}

function Kpi(props: { title: string; value: string; sub: string; sev: Severity }) {
  return (
    <div className="kpi">
      <div className={`kpiAccent ${props.sev}`} />
      <div className="kpiTitle">{props.title}</div>
      <div className="kpiValue">{props.value}</div>
      <div className="kpiSub">{props.sub}</div>
      <span className={`pill small ${props.sev}`}>{sevLabel[props.sev]}</span>
    </div>
  );
}

function Card(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="cardHead">
        <div className="cardTitle">{props.title}</div>
        {props.subtitle ? <div className="cardSub">{props.subtitle}</div> : null}
      </div>
      <div className="cardBody">{props.children}</div>
    </div>
  );
}

function Bar(props: { label: string; pct: number; meta: string; warn?: boolean }) {
  return (
    <div className="barRow">
      <div className="barLabel">{props.label}</div>
      <div className="barTrack">
        <div className={`barFill ${props.warn ? "warning" : ""}`} style={{ width: `${Math.max(0, Math.min(1, props.pct)) * 100}%` }} />
      </div>
      <div className="barMeta">{props.meta}</div>
    </div>
  );
}

function MiniGateway(props: { name: string; status: string; meta: string; sev: Severity }) {
  return (
    <div className="mini">
      <div className="miniTop">
        <div className="miniName">{props.name}</div>
        <span className={`pill small ${props.sev}`}>{props.status}</span>
      </div>
      <div className="miniMeta">{props.meta}</div>
    </div>
  );
}

function MiniStat(props: { label: string; value: string }) {
  return (
    <div className="miniStat">
      <div className="miniLabel">{props.label}</div>
      <div className="miniValue">{props.value}</div>
    </div>
  );
}

function TaskManagerModal(props: { onClose: () => void }) {
  // Real implementation: websocket stream + virtualization.
  const rows = useMemo(
    () =>
      new Array(80).fill(null).map((_, i) => ({
        name: i % 5 === 0 ? `airtel_webhook_worker_${String(i).padStart(2, "0")}` : `python_socket_ingestor_${String(i).padStart(2, "0")}`,
        status: i % 5 === 0 ? "Degraded" : "Running",
        cpu: (Math.random() * 10).toFixed(1),
        mem: (Math.random() * 4).toFixed(1),
        disk: (Math.random() * 1).toFixed(1),
        net: (Math.random() * 1).toFixed(1),
        tok: (Math.random() * 0.2).toFixed(2),
      })),
    []
  );

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modalHead">
          <div className="modalTitle">Task Manager — NAVAS Core (Live)</div>
          <div className="modalActions">
            <span className="pill green">Live</span>
            <button className="btn red">End task</button>
            <button className="x" onClick={props.onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        <div className="tmStats">
          {[
            ["CPU", "63%"],
            ["Memory", "82%"],
            ["Disk", "76%"],
            ["Network", "1.2%"],
            ["GPU", "41%"],
          ].map(([k, v]) => (
            <div key={k} className="tmStat">
              <div className="tmVal">{v}</div>
              <div className="tmKey">{k}</div>
            </div>
          ))}
        </div>

        <div className="tmTable">
          <div className="tmHeadRow">
            <div>Name</div>
            <div>Status</div>
            <div>CPU</div>
            <div>Mem</div>
            <div>Disk</div>
            <div>Net</div>
            <div>Tok/s</div>
          </div>

          <div className="tmBody">
            {rows.map((r) => (
              <div key={r.name} className="tmRow">
                <div className="tmName">{r.name}</div>
                <div className={`tmStatus ${r.status !== "Running" ? "bad" : ""}`}>{r.status}</div>
                <div className="heat">{r.cpu}%</div>
                <div className="heat">{r.mem}%</div>
                <div className="heat">{r.disk}MB/s</div>
                <div className="heat">{r.net}Mbps</div>
                <div className="heat greenHeat">{r.tok}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="modalFoot">HIC/HITL actions are cryptographically logged (audit hash chain).</div>
      </div>
    </div>
  );
}
