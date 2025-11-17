import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
} from 'recharts'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution & Product' },
  { id: 'business-model', label: 'Business Model' },
  { id: 'market', label: 'Market & Competition' },
  { id: 'gtm', label: 'Go-To-Market' },
  { id: 'financials', label: 'Financials' },
  { id: 'seed-plan', label: 'Seed Plan & Use of Funds' },
  { id: 'playbooks', label: 'AI Governance Playbooks' },
  { id: 'memo', label: 'Investor Memo' },
  { id: 'jeff-view', label: 'The Jeff View' },
  { id: 'jeff-diligence', label: 'Jeff Diligence' },
  { id: 'deck', label: 'Slide Outline' },
  { id: 'contact', label: 'How to Use This' },
]

const jeffFaqs = [
  {
    question: '1. Performance & Latency',
    answer: `NeuroAudit is implemented as a low-latency governance sidecar, not a heavy inline proxy.

• Typical p99 overhead: ~4–12 ms per governed action via async policy checks and local decision caches.
• Each workflow chooses fail behavior:
  – Fail-safe (block actions if NeuroAudit is unavailable) for high-risk flows.
  – Fail-open (log-only) for lower-risk or non-critical flows.

This lets CISOs protect critical workflows without introducing unacceptable latency or fragility.`,
  },
  {
    question: '2. Intent Capture Mechanism',
    answer: `We support multiple ways to capture or infer intent:

• Modern agents: a lightweight SDK requires agents to emit structured intent (action, target, amount, user, risk context) before performing a system action.
• Legacy / opaque agents: proxy observers and structured parsing infer intent from outputs and API calls even if we don’t control source code.
• Multi-step / planning agents: we model intent as a sequence and link each step in the reasoning and execution chain.

We don’t need to read model internals — we govern behavior at the action level with rich contextual metadata.`,
  },
  {
    question: '3. Brownfield Reality',
    answer: `We assume a messy AI estate with 200+ systems, ex-employees, and third-party SaaS.

Integration patterns:

• SDKs / middleware wrappers for in-house agents and orchestrators (LangChain, CrewAI, custom).
• API gateways / proxies for SaaS AI tools where we can observe and govern flows via APIs/webhooks.
• Low-code connectors into CRMs, ticketing, payments, and core systems.

The “14 hours per connector” estimate is incremental once base plumbing and patterns exist, not a promise to instrument an entire estate from scratch in that time.`,
  },
  {
    question: '4. Meta-Governance Problem',
    answer: `NeuroAudit itself is treated as a high-value, privileged system:

• Isolated control plane, strong RBAC, hardened infra (VPC/VNet or on-prem options).
• Signed policy bundles so any tampering is detectable.
• Full self-audit: every administrative action is logged and evidence-chained.
• Customers can run NeuroAudit in a dedicated, private environment to minimize blast radius.

If an attacker targets NeuroAudit, they face a hardened surface, signed configs, and complete audit trails — which is far better than bespoke, scattered governance logic.`,
  },
  {
    question: '5. Cryptographic Identity for Agents',
    answer: `“Cryptographic identity” is concrete:

• Agents get short-lived certificates or signed tokens from a non-human PKI.
• Identity lifecycle (issue, rotate, revoke) is programmatic and integrated into orchestration flows.
• Downstream systems expect NeuroAudit-verified identities, reducing impersonation risk.

We move away from untracked service accounts and static API keys toward time-bounded, traceable non-human identities.`,
  },
  {
    question: '6. Evidence Immutability',
    answer: `We maintain a tamper-evident, cryptographically verifiable evidence ledger:

• Append-only log backed by Merkle trees; each record is hashed and chained.
• Every action, intent, and policy decision is signed and time-stamped.
• Evidence export and data sovereignty:
  – Logs can be exported to your archival / legal systems.
  – Storage can be pinned to specific jurisdictions to satisfy residency constraints.

Regulators, auditors, or legal teams can verify that the evidence has not been altered.`,
  },
  {
    question: '7. Policy Configuration Burden',
    answer: `We designed the policy layer to avoid “rule swamp”:

• Policies are written in natural language and compiled into a deterministic DSL.
• We provide workflow-specific templates (e.g., refunds, PII access, credit changes) so teams don’t start from zero.
• Simulation runs policies against historical actions to expose conflicts and excessive false positives before enforcement.
• Policy ownership typically sits with security / risk teams, in partnership with AI platform teams.

Net effect: less configuration from scratch, fewer surprises in production, clearer accountability.`,
  },
  {
    question: '8. Agent vs Workflow Confusion (Concept & Pricing)',
    answer: `We distinguish:

• Workflows: governed business processes (e.g., “refund > $500 with PII involvement”).
• Agents: runtime executors inside those workflows.

Governance attaches primarily to workflows, because that’s where business risk lives. Agents are metered as usage:

• Long-lived named agents billed individually.
• Ephemeral agent swarms billed via aggregate utilization rather than per-instance.

This keeps pricing predictable and aligned with business value, even when architectures are highly dynamic.`,
  },
  {
    question: '9. Simulation Engine Reliability',
    answer: `Simulation doesn’t try to re-run the LLM; it re-runs policies:

• We replay stored intents and context through the policy engine deterministically.
• We do not re-sample model outputs — we use real historical actions and decisions.
• Drift detection looks at changing distributions (denies, escalations, risky actions) over time.

This approach avoids “random” simulations and focuses on policy correctness and drift, not pseudo-reproducing AI randomness.`,
  },
  {
    question: '10. SIEM Integration vs Replacement',
    answer: `NeuroAudit is not a SIEM/SOAR replacement — it is a specialized evidence source:

• Streams structured AI governance events into Splunk, Sentinel, Chronicle, etc.
• SOC analysts continue working inside their existing SIEM console.
• SOAR tools can trigger incident response and automation based on NeuroAudit signals.

We reduce operational fragmentation by feeding richer AI context into systems teams already use, instead of trying to replace them.`,
  },
  {
    question: '11. AI Firewall Differentiation',
    answer: `AI firewalls operate at the text layer:

• Inspect prompts and responses.
• Sometimes validate outputs for toxicity / leakage.

NeuroAudit operates at the **action** layer:

• Governs what the agent actually did in your systems (refunds, data moves, access changes).
• Is model- and vendor-agnostic.
• Produces a behavioral ledger with policy traces and evidence.

Even as firewalls “move downstream,” they are not built as unified behavioral governance platforms with identity, policy, simulation, and evidence in one place.`,
  },
  {
    question: '12. Identity Platform Extension',
    answer: `Identity providers answer: “Who is this identity, and can they authenticate?”

NeuroAudit answers: “Given this identity (human or agent) and this context, should this specific action be allowed, escalated, or denied — and what is the evidence?”

We integrate with identity platforms:

• They manage access to systems.
• We govern behavior across those systems over time, with policy and proof.

The two are complementary, not substitutes.`,
  },
  {
    question: '13. AI Act Ambiguity',
    answer: `The EU AI Act is still evolving, but it clearly mandates:

• Risk management for high-risk systems.
• Logging and traceability.
• Human oversight and accountability.

NeuroAudit’s compliance packs map capabilities to concrete obligations (e.g., Articles 9, 12, 14, 18) for:

• Logging and evidence.
• Risk / control workflows.
• Oversight and escalation.

We are explicit: we support compliance with strong technical controls, but we are not a “magic compliance stamp.”`,
  },
  {
    question: '14. SOC2 AI Addendum',
    answer: `SOC2 AI guidance is emerging, not final.

Our design principles:

• Align with core SOC2 themes (change management, logging, access control, segregation of duties) applied to AI workflows.
• Ensure our evidence model is flexible enough to map into whichever formal frameworks get standardized.

We do not invent proprietary “standards”; we make it easier for auditors to map NeuroAudit evidence to their control catalogs.`,
  },
  {
    question: '15. Evidence in Legal/Regulatory Context',
    answer: `We design logs as potential legal evidence:

• Time-stamped, signed, chain-of-custody tracked.
• Exportable into e-discovery and legal archiving tooling.
• Access and changes to evidence are themselves logged.

We work with counsel and customer legal teams to ensure that log structure and chain-of-custody practices align with admissibility expectations, even though admissibility is always case- and jurisdiction-specific.`,
  },
  {
    question: '16. Services Revenue Trap',
    answer: `Early on, deployments do include services:

• Workflow mapping, connector setup, policy modeling, simulation.

To avoid becoming a consulting company:

• We invest in reusable templates, connectors, and guided configuration.
• Partners (GRC firms, system integrators) take on more of the services load over time.
• Net-new workflow and customer deployments get progressively lighter.

By customer #10–#20, revenue mix tilts toward platform ARR with decreasing marginal services.`,
  },
  {
    question: '17. Expansion Assumption',
    answer: `Workflows across regulated industries share a common grammar:

• Actor, asset, thresholds, approvals, risk scores, evidence.

NeuroAudit exploits that:

• Schemas and evidence models are reused across workflows.
• Only policy thresholds and context-specific conditions need tuning.

That is why expansion is not “rebuild everything per workflow,” but incremental configuration on top of a shared platform.`,
  },
  {
    question: '18. Channel Complexity',
    answer: `Channel design:

• Partners receive attractive license and services margins, but not so high that they’re incented to re-build us.
• Core IP — behavioral ledger, policy compiler, simulation engine, non-human PKI — is technically deep and non-trivial.

We support partners with training, certification, and co-sell motions. They make money delivering NeuroAudit, not reinventing it.`,
  },
  {
    question: '19. Platform Dependency Risk',
    answer: `We treat “what if you go away?” as a design requirement:

• Open, documented schemas for all evidence and logs.
• Reversible connectors and clean boundaries so customers retain control of their systems.
• Self-hosted or private-cloud deployment options for critical customers.
• Clear export paths for all data and configuration.

We are foundational — but not a black box or a one-way door.`,
  },
  {
    question: '20. Acquisition Value vs Build',
    answer: `For platforms like Databricks, ServiceNow, Wiz, or hyperscalers:

• Building this internally requires cross-team coordination across security, observability, AI, and compliance product lines.
• Buying or partnering with a focused, adoption-proven governance stack is faster and cheaper.

Our long-term value is not “we were first,” but:
• Deep integration with AI workflows.
• A defensible behavioral ledger + policy + simulation stack.
• Embeddedness in regulated customer environments.`,
  },
  {
    question: '21. The Synthesis Question – Irreducible Core',
    answer: `NeuroAudit’s irreducible core:

• Causally complete, cryptographically verifiable, real-time governance of AI system actions across heterogeneous agents and workflows.

No existing combination of SIEM, identity, logging, firewalls, and manual process:

• Unifies agent identity, intent, policy, actions, and evidence into a single chain.
• Lets you simulate and test policies across all that behavior.
• Does so in a vendor-neutral way across multiple AI and systems stacks.

That unified behavioral control plane is what justifies introducing NeuroAudit as a foundational layer.`,
  },
]

// 2x2 positions with per-company colors
const competitionPositions = [
  { name: 'NeuroAudit', x: 9, y: 9, isNeuro: true },
  {
    name: 'Astrix',
    x: 3,
    y: 8,
    isNeuro: false,
    color: '#f97316',
    stroke: '#c2410c',
  },
  {
    name: 'Noma',
    x: 4,
    y: 7,
    isNeuro: false,
    color: '#10b981',
    stroke: '#047857',
  },
  {
    name: 'Zenity',
    x: 5,
    y: 6,
    isNeuro: false,
    color: '#0ea5e9',
    stroke: '#0369a1',
  },
  {
    name: 'Credo AI',
    x: 7,
    y: 5,
    isNeuro: false,
    color: '#e11d48',
    stroke: '#9f1239',
  },
  {
    name: 'Holistic AI',
    x: 7,
    y: 4,
    isNeuro: false,
    color: '#22c55e',
    stroke: '#15803d',
  },
  {
    name: 'Securiti AI',
    x: 8,
    y: 4,
    isNeuro: false,
    color: '#a855f7',
    stroke: '#7e22ce',
  },
]

const renderScatterPoint = (props) => {
  const { cx, cy, payload } = props
  const isNeuro = payload?.isNeuro

  const fill = isNeuro ? '#4f46e5' : payload?.color || '#9ca3af'
  const stroke = isNeuro ? '#312e81' : payload?.stroke || '#6b7280'

  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={cx + 8} y={cy - 6} fontSize={10} fill="#0f172a">
        {payload?.name}
      </text>
    </g>
  )
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) {
    const rect = el.getBoundingClientRect()
    const absoluteY = window.scrollY + rect.top - 16
    window.scrollTo({ top: absoluteY, behavior: 'smooth' })
  }
}

export default function App() {
  const [active, setActive] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [jeffMode, setJeffMode] = useState(false)

  useEffect(() => {
    const handler = () => {
      let closestId = active
      let closestDist = Infinity
      sections.forEach((s) => {
        const el = document.getElementById(s.id)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const dist = Math.abs(rect.top - 72)
        if (dist < closestDist) {
          closestDist = dist
          closestId = s.id
        }
      })
      setActive(closestId)
    }
    window.addEventListener('scroll', handler)
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleNavClick = (id) => {
    scrollToSection(id)
    setMobileMenuOpen(false)
  }

  const visibleSections = jeffMode
    ? sections.filter((s) => s.id === 'jeff-view' || s.id === 'jeff-diligence')
    : sections

  return (
    <div className="app-root">
      <div className="app-shell">
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={mobileMenuOpen ? 'open' : ''}></span>
          <span className={mobileMenuOpen ? 'open' : ''}></span>
          <span className={mobileMenuOpen ? 'open' : ''}></span>
        </button>
        <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <div>
              <div className="logo">NeuroAudit</div>
              <div className="logo-tagline">AI agent security, governance & audit</div>
            </div>
          </div>

          <div className="jeff-toggle">
            <div className="jeff-toggle-label">
              <span className="badge badge-soft">Jeff Mode</span>
              <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>
                Show only Jeff-centric views
              </span>
            </div>
            <button
              type="button"
              className={`toggle-switch ${jeffMode ? 'on' : 'off'}`}
              onClick={() => {
                const next = !jeffMode
                setJeffMode(next)
                if (next) scrollToSection('jeff-view')
              }}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <nav className="nav">
            <div className="nav-section-label">INVESTOR BRIEF</div>
            {visibleSections.map((s) => (
              <button
                key={s.id}
                className={['nav-btn', active === s.id ? 'active' : ''].join(' ')}
                onClick={() => handleNavClick(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            Seed-stage concept • This site is a prototype investor brief rendered as a SPA.
          </div>
        </aside>
        <div
          className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        <main className="main">
          <Hero />
          <OverviewSection />
          <ProblemSection />
          <SolutionSection />
          <BusinessModelSection />
          <MarketSection />
          <GtmSection />
          <FinancialsSection />
          <SeedPlanSection />
          <PlaybooksSection />
          <MemoSection />
          <JeffViewSection />
          <JeffDiligenceSection />
          <DeckSection />
          <ContactSection />
        </main>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section>
      <div className="hero-tag">
        <span className="hero-tag-dot" />
        AI security & governance for the agent era
      </div>
      <div className="hero-title">The control plane for AI agents in regulated industries.</div>
      <div className="hero-subtitle">
        NeuroAudit gives enterprises a single place to monitor, govern, and audit every AI-driven
        action across their stack – before regulators, customers, or attackers do. For a hard-nosed,
        operator view of the business, see <strong>The Jeff View</strong> below or flip on{' '}
        <strong>Jeff Mode</strong> in the sidebar.
      </div>
      <div className="hero-cta-row">
        <button className="btn btn-primary" onClick={() => scrollToSection('jeff-view')}>
          See The Jeff View
        </button>
        <button className="btn btn-secondary" onClick={() => scrollToSection('memo')}>
          Read the investor memo
        </button>
        <button className="btn btn-secondary" onClick={() => scrollToSection('deck')}>
          View slide outline
        </button>
        <button className="btn btn-secondary" onClick={() => scrollToSection('financials')}>
          Jump to numbers
        </button>
      </div>
    </section>
  )
}

function SectionFrame({ id, kicker, title, children }) {
  return (
    <section id={id} className="section">
      <div className="section-header">
        <div>
          <div className="section-kicker">{kicker}</div>
          <div className="section-title">{title}</div>
        </div>
      </div>
      <div className="section-body">{children}</div>
    </section>
  )
}

function OverviewSection() {
  return (
    <SectionFrame id="overview" kicker="01" title="Short overview">
      <div className="grid-2">
        <div>
          <p>
            NeuroAudit is an AI security and governance platform that monitors and controls AI
            agents, copilots, and automated workflows in real time. We focus on enterprises that
            already have live AI in production and now need observability, guardrails, and audit
            trails.
          </p>
          <ul className="list">
            <li>Real-time guardrails and human-in-the-loop approvals</li>
            <li>End-to-end audit trail of AI actions and their inputs/outputs</li>
            <li>“What-if” simulation of new policies on historical agent behavior</li>
            <li>Regulator-ready reporting for EU AI Act, NIST AI RMF, and banking guidance</li>
          </ul>
        </div>
        <div className="grid-3">
          <div className="panel">
            <div className="metric-label">Initial target customers</div>
            <div className="metric-value">Fintech, Banks, Insurers</div>
            <div className="metric-caption">Where AI is live & regulators are watching.</div>
          </div>
          <div className="panel">
            <div className="metric-label">Business model</div>
            <div className="metric-value">SaaS</div>
            <div className="metric-caption">Per-agent pricing + platform fee + add-ons.</div>
          </div>
          <div className="panel">
            <div className="metric-label">Gross margin profile</div>
            <div className="metric-value">80%+</div>
            <div className="metric-caption">
              We govern AI agents; we do not run heavy inference.
            </div>
          </div>
        </div>
      </div>
    </SectionFrame>
  )
}

function ProblemSection() {
  return (
    <SectionFrame id="problem" kicker="02" title="Problem – AI is moving faster than controls">
      <div className="grid-2">
        <div>
          <p>
            Enterprises are shipping AI agents into real customer-facing and back-office workflows
            – refunds, credit decisions, PII handling, HR operations – without the control plane
            they take for granted in traditional software.
          </p>
          <ul className="list">
            <li>No unified view of what agents are actually doing in production.</li>
            <li>Hard to answer “why did the AI do this?” for regulators or customers.</li>
            <li>Guardrails exist at the prompt/model layer, not at the workflow/action layer.</li>
            <li>
              AI regulations (EU AI Act, emerging US rules) require traceability and risk
              management that current tooling does not provide.
            </li>
          </ul>
        </div>
        <div className="panel">
          <div className="metric-label">The question CISOs keep asking</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>
            “If an AI agent touches card limits, refunds, PII, or production systems – where do I
            see its actions, how are they governed, and what can I show to an auditor six months
            from now?”
          </div>
          <div style={{ marginTop: 12 }} className="badge">
            <span className="badge-dot" />
            NeuroAudit is designed to be that answer.
          </div>
        </div>
      </div>
    </SectionFrame>
  )
}

function SolutionSection() {
  return (
    <SectionFrame id="solution" kicker="03" title="Solution & product – The AI agent control plane">
      <div className="grid-2">
        <div>
          <p>NeuroAudit is a control plane that sits between AI agents and the systems they act on.</p>
          <ul className="list">
            <li>
              <strong>Observe:</strong> capture every AI-driven action across agents and systems in
              one timeline.
            </li>
            <li>
              <strong>Govern:</strong> apply policies like “refunds above $500 require human
              approval” or “block PII exports outside the secure enclave”.
            </li>
            <li>
              <strong>Simulate:</strong> run “what-if” simulations of new policies against past
              behavior before going live.
            </li>
            <li>
              <strong>Audit:</strong> generate regulator-ready evidence packages with full context.
            </li>
          </ul>
        </div>
        <div className="panel">
          <div className="metric-label">Product pillars</div>
          <ul className="list">
            <li>Unified activity log for AI agents (who did what, where, and why).</li>
            <li>Policy builder in plain language, mapped to enterprise systems.</li>
            <li>Simulation engine over historical agent actions.</li>
            <li>Global assistant that orchestrates views and workflows for security teams.</li>
          </ul>
        </div>
      </div>
    </SectionFrame>
  )
}

function BusinessModelSection() {
  return (
    <SectionFrame id="business-model" kicker="04" title="Business model – SaaS with per-agent pricing">
      <div className="grid-2">
        <div>
          <p>We monetize in three primary ways:</p>
          <ul className="list">
            <li>
              <strong>Platform fee:</strong> $1k–4k / month for access to the console, policy
              engine, simulation, and audit trail.
            </li>
            <li>
              <strong>Per-agent pricing:</strong> $40–120 / agent / month depending on volume and
              criticality.
            </li>
            <li>
              <strong>Add-ons:</strong> advanced simulation, regulatory reporting packs, premium
              support, and on-premise deployments.
            </li>
          </ul>
          <p>
            For a mid-market fintech with 200 agents, this yields roughly $180k ARR. For a large
            bank, a single deployment can be $1M+ ARR.
          </p>
        </div>
        <div className="panel">
          <div className="metric-label">Example pricing snapshot</div>
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Agents</th>
                <th>ARR</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mid-market fintech</td>
                <td>200</td>
                <td>$180k</td>
              </tr>
              <tr>
                <td>Large bank</td>
                <td>1,500</td>
                <td>$1.45M</td>
              </tr>
            </tbody>
          </table>
          <div className="kpi-row">
            <div className="kpi-pill">Target gross margin: 80%+</div>
            <div className="kpi-pill">Net retention goal: 125%+</div>
            <div className="kpi-pill">Land-and-expand motion</div>
          </div>
        </div>
      </div>
    </SectionFrame>
  )
}

function MarketSection() {
  return (
    <SectionFrame id="market" kicker="05" title="Market & competition">
      <div className="grid-2">
        <div>
          <p>
            The AI security and governance category is predicted to reach tens of billions of
            dollars this decade. Our wedge is narrow and specific: we govern <em>AI agent actions</em>{' '}
            at the workflow and system level.
          </p>
          <ul className="list">
            <li>
              <strong>TAM:</strong> ~$25B AI security/governance by 2030.
            </li>
            <li>
              <strong>SAM:</strong> ~$8B focused on enterprises with live AI agents.
            </li>
            <li>
              <strong>SOM:</strong> ~$0.5B reachable in fintech, banking, insurance, and SaaS in the
              next 3–5 years.
            </li>
          </ul>
        </div>
        <div className="panel">
          <div className="metric-label">Competitive positioning</div>
          <table className="table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Focus</th>
                <th>Gap NeuroAudit fills</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Model monitoring tools</td>
                <td>Model performance, drift</td>
                <td>No workflow-level or agent action control.</td>
              </tr>
              <tr>
                <td>Prompt security tools</td>
                <td>Prompt injection, data exfil</td>
                <td>Do not model business workflows or approval logic.</td>
              </tr>
              <tr>
                <td>Traditional observability</td>
                <td>CPU, logs, traces</td>
                <td>Cannot answer “what did the AI actually do, and why?”.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </SectionFrame>
  )
}

function GtmSection() {
  return (
    <SectionFrame id="gtm" kicker="06" title="Go-to-market – land-and-expand">
      <div className="grid-2">
        <div>
          <p>We start where AI is already creating anxiety and budget pressure.</p>
          <ul className="list">
            <li>
              <strong>Phase 1 – design partner motion:</strong> 3–5 fintechs/insurers with live AI
              workflows. Integrate with 1–2 critical systems (payments, card core, CRM).
            </li>
            <li>
              <strong>Phase 2 – mid-market & enterprise sales:</strong> direct outreach to CISOs,
              Chief Risk Officers, and Heads of AI/ML & Platform Engineering.
            </li>
            <li>
              <strong>Phase 3 – partner ecosystem:</strong> consulting firms, cloud providers, and
              AI platform partners packaging NeuroAudit into their AI governance offerings.
            </li>
          </ul>
        </div>
        <div className="panel">
          <div className="metric-label">Sales motion</div>
          <ul className="list">
            <li>Security-led deals, anchored on risk and regulatory deadlines.</li>
            <li>
              A wedge use case (e.g., refund guardrails) that we can deploy and show value in under
              30 days.
            </li>
            <li>Expansion to other workflows and business units once trust is earned.</li>
          </ul>
          <div className="kpi-row">
            <div className="kpi-pill">Time-to-first-value &lt; 30 days</div>
            <div className="kpi-pill">Initial ACV: $80k–250k</div>
          </div>
        </div>
      </div>
    </SectionFrame>
  )
}

function FinancialsSection() {
  return (
    <SectionFrame id="financials" kicker="07" title="3-year financial model – high-level view">
      <div className="grid-2">
        <div>
          <p>Illustrative top-line model (not a forecast, but directional).</p>
          <table className="table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Customers</th>
                <th>Avg ARR / customer</th>
                <th>Total ARR</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Year 1</td>
                <td>10</td>
                <td>$50k</td>
                <td>$0.5M</td>
              </tr>
              <tr>
                <td>Year 2</td>
                <td>30</td>
                <td>$70k</td>
                <td>$2.1M</td>
              </tr>
              <tr>
                <td>Year 3</td>
                <td>60</td>
                <td>$90k</td>
                <td>$5.4M</td>
              </tr>
            </tbody>
          </table>
          <p>
            The model assumes conservative initial ACVs with expansion over time as NeuroAudit
            governs more agents and workflows per customer.
          </p>
        </div>
        <div className="panel">
          <div className="metric-label">Key financial design principles</div>
          <ul className="list">
            <li>High gross margins by avoiding heavy inference compute.</li>
            <li>
              Net dollar retention driven by adding workflows, agents, environments, and compliance
              modules.
            </li>
            <li>Sales efficiency targeted via partner-led deals and short proofs of value.</li>
            <li>
              Long-term upside as AI governance becomes a line item in every serious AI budget.
            </li>
          </ul>
        </div>
      </div>
    </SectionFrame>
  )
}

function SeedPlanSection() {
  return (
    <SectionFrame
      id="seed-plan"
      kicker="08"
      title="Seed plan, use of funds & PMF strategy"
    >
      <div className="grid-2">
        <div>
          <p>
            Assume a <strong>$2.5M seed round</strong> with a target runway of{' '}
            <strong>18–24 months</strong> to reach ~<strong>$1M ARR</strong> and clear PMF signals.
          </p>
          <div className="panel">
            <div className="metric-label">Use of funds – high-level allocation</div>
            <table className="table" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>% of round</th>
                  <th>Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Founders & Ops</td>
                  <td>15%</td>
                  <td>$375k</td>
                  <td>Founder salaries, basic ops, legal, accounting.</td>
                </tr>
                <tr>
                  <td>Core Engineering</td>
                  <td>45%</td>
                  <td>$1.125M</td>
                  <td>
                    3–4 senior engineers across identity, policy engine, ledger, connectors.
                  </td>
                </tr>
                <tr>
                  <td>Design Partners & GTM</td>
                  <td>20%</td>
                  <td>$500k</td>
                  <td>
                    Travel, POCs, pilots, early sales hire, content & community for CISOs.
                  </td>
                </tr>
                <tr>
                  <td>Security & Compliance Infra</td>
                  <td>10%</td>
                  <td>$250k</td>
                  <td>
                    SOC2/ISO prep, pen tests, security tooling, cloud hardening, legal support.
                  </td>
                </tr>
                <tr>
                  <td>Buffer & Contingency</td>
                  <td>10%</td>
                  <td>$250k</td>
                  <td>Slip in timelines, extra hires, or opportunistic GTM bets.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="subheading" style={{ marginTop: 20 }}>
            Team shape & hiring sequence
          </h3>
          <ul className="list">
            <li>
              <strong>Day 0 team:</strong> 2 founders (product/architecture + GTM/enterprise) doing
              everything: design partner outreach, architecture, early code, and deployment.
            </li>
            <li>
              <strong>Months 0–3:</strong> First 2–3 senior engineers:
              <ul className="list">
                <li>Infra/identity/security engineer – non-human PKI, auth, control plane.</li>
                <li>
                  Policy/ledger engineer – NL→DSL compiler, rules engine, Merkle tree evidence
                  store.
                </li>
                <li>Integrations engineer – connectors, APIs, webhooks, agent frameworks.</li>
              </ul>
            </li>
            <li>
              <strong>Months 6–12:</strong> 1–2 additional hires:
              <ul className="list">
                <li>Customer engineer / solutions architect for design partners.</li>
                <li>Part-time or fractional PM / design to refine workflows & UX.</li>
              </ul>
            </li>
            <li>
              <strong>Months 12–18:</strong> First dedicated GTM hire (AE or sales lead) and
              customer success lead once 3–5 paying customers exist.
            </li>
          </ul>
        </div>

        <div className="panel">
          <div className="metric-label">Milestones & PMF path</div>
          <p style={{ marginTop: 8 }}>
            Capital is tied directly to milestones. Each tranche of work has a clear “go / adjust /
            kill” decision.
          </p>

          <h4 className="subheading" style={{ marginTop: 10 }}>
            Milestone 1 – 0–6 months: De-risk core platform & land design partners
          </h4>
          <ul className="list">
            <li>Ship v1 of identity, policy, and evidence primitives.</li>
            <li>
              1–2 reference connectors (e.g., payments/ledger, CRM, ticketing) in production for
              real workflows.
            </li>
            <li>
              <strong>Goal:</strong> 1 design partner live, 1 governed workflow, &lt;30 days to
              first value demonstrated.
            </li>
            <li>
              <strong>PMF signal:</strong> buyer willingness to expand workflows and introduce us to
              peers / board.
            </li>
          </ul>

          <h4 className="subheading" style={{ marginTop: 10 }}>
            Milestone 2 – 6–12 months: Repeatability & monetization
          </h4>
          <ul className="list">
            <li>3–5 design partners, at least 2 paying production deployments.</li>
            <li>Common policy templates & playbooks for refunds, PII, access, and credit flows.</li>
            <li>
              Basic SOC2 readiness (controls in place, audit started), referenceable security story
              for CISOs.
            </li>
            <li>
              <strong>Goal:</strong> $300–500k ARR, early net retention from workflow expansion.
            </li>
            <li>
              <strong>PMF signal:</strong> customers ask to bring more systems/agents under
              governance without heavy selling.
            </li>
          </ul>

          <h4 className="subheading" style={{ marginTop: 10 }}>
            Milestone 3 – 12–24 months: Scale & Series A readiness
          </h4>
          <ul className="list">
            <li>5–8 customers, each $150–200k+ in ARR.</li>
            <li>Evidence of repeatable implementation motion with partners / SIs.</li>
            <li>Demonstrated expansion: customers with 3–5+ governed workflows.</li>
            <li>
              <strong>Goal:</strong> ~$1M ARR, clear pipeline coverage, and path to $3M+ within
              18–24 months.
            </li>
            <li>
              <strong>PMF signal:</strong> inbound or pull from CISOs/boards; budget lines created
              explicitly for AI agent governance.
            </li>
          </ul>

          <h4 className="subheading" style={{ marginTop: 10 }}>
            How we search for PMF in practice
          </h4>
          <ul className="list">
            <li>
              Start with <strong>“hot pain” workflows</strong> (refunds, credit changes, PII export)
              where AI is already in production and regulators care.
            </li>
            <li>
              Design partner contracts tied to <strong>explicit outcomes</strong>:
              <ul className="list">
                <li>Mean time to detect risky AI actions drops.</li>
                <li>Regulator/audit questions answered faster with NeuroAudit evidence.</li>
                <li>
                  Reduction in manual approvals that still keeps risk within thresholds.
                </li>
              </ul>
            </li>
            <li>
              Iterate policy / UX weekly with CISOs and platform teams until workflows are “boring”
              and trustworthy.
            </li>
            <li>
              Align pricing experiments with value: platform + per-agent + per-workflow bundles,
              test willingness to pay with every new deployment.
            </li>
          </ul>

          <h4 className="subheading" style={{ marginTop: 10 }}>
            If money were not a problem – GTM acceleration
          </h4>
          <p className="muted">
            We would keep the product scope tight, but accelerate GTM and ecosystem plays:
          </p>
          <ul className="list">
            <li>
              Hire 1–2 <strong>top-tier enterprise AEs</strong> with existing CISO networks in
              fintech/FSI.
            </li>
            <li>
              Fund a small <strong>field CTO / evangelist</strong> team to own conference talks,
              reference architectures, and AI governance roundtables.
            </li>
            <li>
              Co-build <strong>vertical playbooks</strong> with 1–2 major partners (cloud providers,
              big SIs) and sponsor integrated reference deployments.
            </li>
            <li>
              Invest in <strong>community & content</strong>: CISO working groups, “AI Agent
              Incidents” post-mortems, and governance benchmarks that NeuroAudit can anchor.
            </li>
            <li>
              Reserve budget for <strong>strategic pilots</strong> in Tier-1 logos (even at lower
              initial ACV) to build brand and referenceability ahead of Series A.
            </li>
          </ul>
        </div>
      </div>
    </SectionFrame>
  )
}

function PlaybooksSection() {
  return (
    <SectionFrame id="playbooks" kicker="09" title="AI governance playbooks – concrete workflows">
      <div className="grid-2">
        <div>
          <p>
            NeuroAudit ships with opinionated playbooks that map directly to real-world workflows
            security and risk teams care about.
          </p>
          <ul className="list">
            <li>
              <strong>Refund guardrails:</strong> “Refunds above $X or with Y risk signals must go
              to human review.”
            </li>
            <li>
              <strong>PII export control:</strong> “Block bulk exports of PII to destinations
              outside the secure enclave.”
            </li>
            <li>
              <strong>Credit decision oversight:</strong> “Route certain credit decisions for human
              review; log and explain all adverse actions.”
            </li>
            <li>
              <strong>Access & permissions:</strong> “Temporary access grants must expire and be
              tied to explicit approvals.”
            </li>
          </ul>
        </div>
        <div className="panel">
          <div className="metric-label">Why playbooks matter</div>
          <ul className="list">
            <li>Reduce time-to-value – teams can turn on patterns instead of starting from zero.</li>
            <li>
              Create a shared language between Security, Risk, Ops, and Engineering around what
              “good” looks like.
            </li>
            <li>Demonstrate to auditors that governance is systematic, not ad-hoc.</li>
          </ul>
        </div>
      </div>
    </SectionFrame>
  )
}

function MemoSection() {
  const memoText = `NeuroAudit – Investor Memo (draft)

Thesis
AI agents will be embedded into every serious enterprise workflow, from underwriting and refunds to HR and operations. Once that happens, the question every CISO, Chief Risk Officer, and regulator will ask is simple: who is watching the AI, what are the guardrails, and how do we prove it?

NeuroAudit is building the control plane for AI agents in regulated industries. We are not another model provider or prompt security layer. We sit at the agent/workflow boundary and answer three questions:
• What did the AI actually do? (observability)
• Should it have been allowed? (governance)
• Can we prove this to an auditor six months from now? (auditability)

Why now
• Enterprises are already putting AI into refunds, customer service, credit, and PII-heavy workflows.
• AI regulations (EU AI Act, NIST AI RMF, upcoming sector-specific rules) explicitly call for risk management, human oversight, and traceability.
• There is no Datadog-equivalent for AI agents today – tools either monitor models or prompts, not actions tied to business workflows.

Product
NeuroAudit ingests AI-driven actions (e.g. “issue refund”, “change credit limit”, “export table”), enriches them with context (agent, system, user, inputs, outputs), and runs them through a policy engine and simulation layer.

Core capabilities:
• Activity log: a single pane-of-glass timeline of AI actions across systems.
• Policy builder: guardrails defined in simple conditions and mapped to real systems.
• Simulation: run policies against historical actions to quantify impact before rollout.
• Approvals: human-in-the-loop workflows for high-risk actions.
• Reporting: exportable audit packages with full evidence chains.

Business model
We sell as SaaS with:
• Platform access fee ($1k–4k / month)
• Per-agent pricing ($40–120 / agent / month)
• Add-ons for simulation, regulatory packs, and on-prem deployments.

This creates a high-ACV, high-margin, expansion-friendly business model similar to security and observability platforms.

Moat
Our defensibility comes from:
• Behavioral baselines of agent actions across customers and verticals.
• Policy and simulation engine tightly connected to enterprise systems.
• Deep integrations with AI platforms and legacy systems, which are painful to rip out.
• Being the system-of-record for AI agent governance in regulated environments.

Ask
We are exploring a pre-seed/seed round to:
• Build production-grade integrations and policy engine
• Run 3–5 design partner deployments in fintech/insurance
• Achieve early ARR with strong expansion signals.`
  return (
    <SectionFrame id="memo" kicker="10" title="Investor memo – narrative summary">
      <div className="memo-block">{memoText}</div>
    </SectionFrame>
  )
}

function JeffViewSection() {
  return (
    <SectionFrame id="jeff-view" kicker="11" title="The Jeff View – Hard Questions & Answers">
      <div className="grid-2">
        <div>
          <p>
            This section structures the NeuroAudit plan the way Jeff likes to evaluate companies:
            clear platform definition, buyer clarity, build-vs-buy reality, competitive moat,
            timing, and a full CISO due-diligence Q&amp;A.
          </p>

          <h3 className="subheading">1. App or Platform?</h3>
          <p>
            Jeff&apos;s first forcing question: “If this is an app, it&apos;s a feature. If it&apos;s a
            platform, show me the primitives.”
          </p>
          <p>
            NeuroAudit is a platform defined by five primitives reused across every deployment:
          </p>
          <ul className="list">
            <li>
              <strong>Identity</strong> – cryptographic identities for non-human agents.
            </li>
            <li>
              <strong>Intent</strong> – structured capture/inference of what an agent is trying to
              do.
            </li>
            <li>
              <strong>Policy</strong> – natural-language rules compiled to a deterministic DSL.
            </li>
            <li>
              <strong>Action</strong> – inline governance of system-level actions (refunds, credit,
              PII, access).
            </li>
            <li>
              <strong>Evidence</strong> – append-only, verifiable behavioral ledger for regulators
              and auditors.
            </li>
          </ul>

          <h3 className="subheading">2. Who Actually Buys?</h3>
          <p>The buyer stack is explicit:</p>
          <ul className="list">
            <li>
              <strong>CISO</strong> – primary economic buyer; owns AI risk and security posture.
            </li>
            <li>
              <strong>Head of AI / Platform Engineering</strong> – technical champion and
              implementer.
            </li>
            <li>
              <strong>CRO / Compliance</strong> – economic influencer focused on evidence &amp;
              controls.
            </li>
          </ul>

          <h3 className="subheading">3. How Do They Solve It Today?</h3>
          <p>
            Today’s reality is a patchwork: SIEM logs, prompt security tools, homegrown scripts,
            Slack approvals, and CSV exports. These are:
          </p>
          <ul className="list">
            <li>
              <strong>Incomplete</strong> – no unified view of AI behavior across workflows.
            </li>
            <li>
              <strong>Unverifiable</strong> – no cryptographic integrity or chain-of-custody.
            </li>
            <li>
              <strong>Non-deterministic</strong> – policies exist in docs, not in code.
            </li>
            <li>
              <strong>Non-compliant</strong> – difficult to defend under AI Act / SOC2 / ISO 42001.
            </li>
          </ul>

          <h3 className="subheading">4. Build vs Buy – Can They Just Build It?</h3>
          <p>
            Jeff’s CFO lens: “If I can build this cheaper internally, your deal dies.”
          </p>
          <p>To replicate NeuroAudit, an enterprise must build:</p>
          <ul className="list">
            <li>Non-human identity / PKI and lifecycle management for agents.</li>
            <li>Intent capture and normalization across multiple agent frameworks.</li>
            <li>A behavioral telemetry stack that spans tools, APIs, and vendors.</li>
            <li>An inline policy engine with NL→DSL compilation and real-time enforcement.</li>
            <li>An immutable, cryptographically verifiable evidence ledger.</li>
            <li>A simulation and drift detection engine tuned for agent behavior.</li>
          </ul>
          <p>
            Realistic cost: <strong>6–10 engineers × 12–18 months = $3.6M–$6.2M</strong> plus
            ongoing maintenance. NeuroAudit typically lands at{' '}
            <strong>$180K–$480K/year</strong> for a serious deployment.
          </p>

          <h3 className="subheading">5. Why Won’t Big Vendors Crush This?</h3>
          <p>
            Jeff&apos;s competitive question: “Why wouldn&apos;t Microsoft, Google, or Palo Alto just ship
            this?”
          </p>
          <p>Our moat is depth + neutrality:</p>
          <ul className="list">
            <li>Neutral across OpenAI, Anthropic, local models, custom agents, SaaS AI.</li>
            <li>Behavioral ledger purpose-built for AI actions, not generic logs.</li>
            <li>NL→DSL policy compiler wired to AI workflows and systems of record.</li>
            <li>Non-human PKI and lifecycle management for agents.</li>
            <li>Simulation engine focused on agent behavior and policy drift.</li>
            <li>Vertical templates and compliance packs for regulated workflows.</li>
          </ul>

          <h3 className="subheading">6. Why Now?</h3>
          <p>Timing is driven by regulation and real incidents:</p>
          <ul className="list">
            <li>EU AI Act enforcement windows arriving for high-risk systems.</li>
            <li>Emerging SOC2 AI and ISO/IEC 42001 frameworks.</li>
            <li>AI-caused financial, data, and reputational incidents appearing in the wild.</li>
            <li>Explosion of multi-agent architectures acting on real systems, not just chat.</li>
            <li>
              Boards and regulators asking: “What are your AI agents doing, and how do you prove
              it?”
            </li>
          </ul>

          <h3 className="subheading">7. Competitive Landscape – Startups & Vendors</h3>
          <p>
            How NeuroAudit sits relative to current AI governance / security players Jeff will ask
            about:
          </p>
          <div className="panel" style={{ marginTop: 8 }}>
            <div className="metric-label">Competitive matrix (Stage / Focus)</div>
            <table className="table" style={{ marginTop: 6 }}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Stage / Focus</th>
                  <th>How NeuroAudit Differs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Credo AI</td>
                  <td>Growth – AI governance, risk &amp; compliance for models &amp; vendors.</td>
                  <td>
                    Strong on model/vendor governance and policy catalogs; less focused on
                    fine-grained, real-time control of AI agent actions inside business workflows
                    with a cryptographic evidence ledger.
                  </td>
                </tr>
                <tr>
                  <td>Zenity</td>
                  <td>Startup – security for AI agents &amp; SaaS/low-code environments.</td>
                  <td>
                    Focuses on agent and SaaS security posture. NeuroAudit goes deeper on per-action
                    policy decisions, approvals, simulation, and auditor-grade evidence for
                    regulated workflows.
                  </td>
                </tr>
                <tr>
                  <td>Noma Security</td>
                  <td>Startup – AI agent security &amp; governance, runtime controls.</td>
                  <td>
                    Strong on agent and AI asset risk; NeuroAudit positions itself as the
                    action-of-record layer: identity → intent → policy → action → evidence across
                    heterogeneous workflows.
                  </td>
                </tr>
                <tr>
                  <td>Securiti AI</td>
                  <td>Growth – AI security &amp; data/model governance.</td>
                  <td>
                    Excellent data and model governance; NeuroAudit complements this by governing
                    what agents actually do to systems (refunds, credit changes, PII exports,
                    access) and proving it for auditors and regulators.
                  </td>
                </tr>
                <tr>
                  <td>Astrix</td>
                  <td>Startup – non-human / agent identity &amp; least-privilege access.</td>
                  <td>
                    Astrix focuses on identity &amp; access for agents (one of our primitives).
                    NeuroAudit incorporates that primitive but adds policy compilation,
                    per-action governance, simulation, and a behavioral ledger on top.
                  </td>
                </tr>
                <tr>
                  <td>Holistic AI</td>
                  <td>Growth – lifecycle AI governance across models, risk, compliance.</td>
                  <td>
                    Broad AI governance across the lifecycle; NeuroAudit goes narrow and deep on
                    agent behavior in production systems: real-time policy enforcement, simulations,
                    and evidence tailored for AI actions.
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="muted" style={{ marginTop: 6 }}>
              TL;DR: most competitors secure prompts, models, networks, or identities. NeuroAudit
              secures the <em>actions</em> AI agents take in your production systems — tying
              identity, intent, policy, execution, and evidence into a single control plane.
            </p>

            <div
              style={{
                marginTop: 10,
                paddingTop: 8,
                borderTop: '1px solid rgba(148, 163, 184, 0.4)',
                fontSize: 11,
              }}
            >
              <div className="metric-label">2×2 – Where NeuroAudit Sits</div>
              <p className="muted" style={{ marginBottom: 6 }}>
                Y-axis: Depth of action governance • X-axis: Breadth across AI &amp; systems
              </p>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Breadth"
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 10]}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Depth"
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 10]}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={competitionPositions} name="Vendors" shape={renderScatterPoint} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="metric-label">CISO Due-Diligence FAQ (21 Qs)</div>
          <div className="metric-caption" style={{ marginBottom: 12 }}>
            The following questions and answers map directly to how a skeptical CISO or CIO would
            interrogate NeuroAudit before approving a deployment.
          </div>

          <div className="faq-list">
            {jeffFaqs.map((item, idx) => (
              <details key={idx} className="faq-item" open={idx < 2}>
                <summary className="faq-question">{item.question}</summary>
                <p className="faq-answer">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </SectionFrame>
  )
}

function JeffDiligenceSection() {
  return (
    <SectionFrame
      id="jeff-diligence"
      kicker="12"
      title="The Jeff Diligence Framework – Founder–Market–Execution Fit"
    >
      <p>
        This section encodes Jeff’s full due-diligence framework for NeuroAudit: how he evaluates
        founder–market fit, technical depth, enterprise sales muscle, capital discipline, and
        long-term resilience. Use it as both an internal scorecard and an investor-facing “we know
        how we’ll be judged” artifact.
      </p>

      <div className="grid-2">
        <div>
          <details className="faq-item" open>
            <summary className="faq-question">
              I. Technical Credibility &amp; Building Capability
            </summary>
            <div className="faq-answer">
              <p>
                Jeff is testing whether the founding team can actually design and build the four hard
                pillars of NeuroAudit:
              </p>
              <ul className="list">
                <li>Identity systems for non-human actors.</li>
                <li>Policy engines and NL→DSL compilers.</li>
                <li>Cryptographic, append-only evidence ledgers.</li>
                <li>Enterprise-grade integration connectors.</li>
              </ul>
              <p>Key questions he will ask:</p>
              <ul className="list">
                <li>
                  Walk me through your most complex technical architecture decision in the last five
                  years. What constraint made it hard? How did you reason through tradeoffs?
                </li>
                <li>Show me working code or a prototype. What have you personally shipped recently?</li>
                <li>
                  Of identity, policy, ledger, and connectors — which can you personally architect?
                  Which require early hires?
                </li>
                <li>
                  Have you built append-only, tamper-evident systems before? Walk me through the
                  architecture.
                </li>
                <li>
                  The policy engine compiles natural language to deterministic DSL. What’s your
                  approach? Any prior compiler/policy engine experience?
                </li>
              </ul>
              <p>
                <strong>Decision criteria:</strong>
              </p>
              <ul className="list">
                <li>
                  ✅ <strong>PASS</strong>: At least one founder has shipped production
                  infrastructure/security systems; working prototype exists; clear technical tradeoff
                  articulation.
                </li>
                <li>
                  ⚠️ <strong>CONCERN</strong>: Technical depth feels theoretical; no working code;
                  hiring plan is hand-wavy.
                </li>
                <li>
                  ❌ <strong>FAIL</strong>: Cannot explain core primitives; dramatically underestimates
                  integration and infra complexity.
                </li>
              </ul>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              II. Enterprise Sales Muscle &amp; Buyer Navigation
            </summary>
            <div className="faq-answer">
              <p>
                NeuroAudit is a multi-stakeholder, six-figure enterprise sale. Jeff wants proof
                you’ve done this movie before.
              </p>
              <p>Key questions:</p>
              <ul className="list">
                <li>
                  Walk me through the last time you sold a five- or six-figure enterprise deal. Who
                  was the economic buyer? How long did it take? What almost killed it?
                </li>
                <li>
                  Have you sold into buying committees (security, engineering, compliance,
                  procurement)? What did that look like?
                </li>
                <li>Have you done founder-led sales before? How far will you carry direct sales?</li>
                <li>
                  Who are your first 3–5 design partners? Are those paid pilots, and what is the
                  conversion trigger to production?
                </li>
                <li>
                  If regulated design partners are slow to land, what is the pivot (vertical,
                  workflow, ICP)?
                </li>
              </ul>
              <p>
                <strong>Decision criteria:</strong>
              </p>
              <ul className="list">
                <li>
                  ✅ <strong>PASS</strong>: Has closed enterprise deals &gt;$100K; understands buying
                  committees; has warm CISO paths; realistic about 6–12 month sales cycles.
                </li>
                <li>
                  ⚠️ <strong>CONCERN</strong>: Strong consulting/presales but never owned quota; vague
                  design partner list; expects faster cycles than reality.
                </li>
                <li>
                  ❌ <strong>FAIL</strong>: No enterprise sales; “product sells itself”; no plan for
                  design partners.
                </li>
              </ul>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              III. Domain Authority &amp; Market Credibility
            </summary>
            <div className="faq-answer">
              <p>
                Jeff wants to know whether CISOs and CROs will see you as credible on AI governance
                in regulated environments.
              </p>
              <p>Key questions:</p>
              <ul className="list">
                <li>
                  Why you? What have you built or lived through that makes you the credible voice on
                  AI agent governance for banks/fintech/insurers?
                </li>
                <li>
                  Have you shipped systems under GDPR, HIPAA, SOX, PCI, or similar regulatory
                  constraints?
                </li>
                <li>
                  What’s your personal experience with SOC2 / ISO 42001 / EU AI Act style audits?
                </li>
                <li>
                  Who are your advisors in security/compliance/AI governance, and will they make
                  intros to buyers?
                </li>
              </ul>
              <p>
                <strong>Decision criteria:</strong>
              </p>
              <ul className="list">
                <li>
                  ✅ <strong>PASS</strong>: Deep security/compliance/regulated vertical experience;
                  credible advisors; recognized in relevant communities.
                </li>
                <li>
                  ⚠️ <strong>CONCERN</strong>: Enterprise/AI tooling experience but little direct
                  compliance or security exposure.
                </li>
                <li>
                  ❌ <strong>FAIL</strong>: Building from “wishful thinking” with no domain proof
                  points; buyers have no reason to trust the team.
                </li>
              </ul>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              IV. Execution Capability &amp; Operational Grind
            </summary>
            <div className="faq-answer">
              <p>
                This is about whether you can survive the first 5–10 design partner deployments,
                which are high-touch and messy.
              </p>
              <p>Key questions:</p>
              <ul className="list">
                <li>
                  You promise &lt;30 days to first value. Break that down: Day 1, Day 15, Day 30.
                </li>
                <li>
                  Who is doing on-the-ground integrations for customer #1–#5? Founder, early
                  engineer, partner?
                </li>
                <li>
                  If a custom agent framework breaks your connector at 2am, who fixes it? What’s the
                  SLA mindset?
                </li>
                <li>
                  At $1M ARR (5–8 customers at $150–200K), are you prepared for services-heavy
                  realities while still building product?
                </li>
              </ul>
              <p>
                <strong>Decision criteria:</strong>
              </p>
              <ul className="list">
                <li>
                  ✅ <strong>PASS</strong>: Founder has done integration/implementation personally;
                  realistic on high-touch early customers; clear view of grind.
                </li>
                <li>
                  ⚠️ <strong>CONCERN</strong>: Underestimates implementation complexity; expects
                  self-serve too early.
                </li>
                <li>
                  ❌ <strong>FAIL</strong>: “Mostly automated implementation”; no plan for customer
                  success or production firefighting.
                </li>
              </ul>
            </div>
          </details>
        </div>

        {/* Right column – capital, psychology, scoring, red flags */}
        <div>
          <details className="faq-item">
            <summary className="faq-question">
              V. Capital Discipline &amp; Financial Judgment
            </summary>
            <div className="faq-answer">
              <p>
                Jeff cares deeply about how you allocate the $2.5M seed, what you pay yourselves,
                and how you react when plans slip.
              </p>
              <p>Key questions:</p>
              <ul className="list">
                <li>
                  How much do founders pay themselves? How long can you personally sustain those
                  salaries?
                </li>
                <li>
                  Engineering budget vs scope: if core platform takes 12 months instead of 6, what
                  gets descoped?
                </li>
                <li>
                  What’s your Month 12 contingency plan if milestones are behind and you have
                  ~$800K left?
                </li>
                <li>
                  At what cash position do you start raising the next round? What if Series A takes
                  longer than expected?
                </li>
              </ul>
              <p>
                <strong>Decision criteria:</strong>
              </p>
              <ul className="list">
                <li>
                  ✅ <strong>PASS</strong>: Founder salaries &lt;$120K; clear contingency plans; focus
                  on capital efficiency.
                </li>
                <li>
                  ⚠️ <strong>CONCERN</strong>: Higher comp, vague “we’ll hit milestones” belief.
                </li>
                <li>
                  ❌ <strong>FAIL</strong>: Founder comp &gt;$150K at pre-revenue; assumes $2.5M
                  straightforwardly gets to Series A.
                </li>
              </ul>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">
              VI. Founder Psychology, Resilience &amp; Team Dynamics
            </summary>
            <div className="faq-answer">
              <p>
                Enterprise infra for a new category is a 5–7 year grind. Jeff is looking for durable
                motivation and evidence of surviving “the valley.”
              </p>
              <p>Key questions:</p>
              <ul className="list">
                <li>
                  Hardest professional failure or setback? What did you learn and how did it change
                  your decisions?
                </li>
                <li>
                  Have you been through failed startups, pivots, layoffs, or crises? What happened?
                </li>
                <li>
                  How do you and your co-founder resolve real disagreement (e.g., pivot vs stay the
                  course at Month 10)?
                </li>
                <li>
                  What are you exceptionally good at, and what drains you? Where do you need help?
                </li>
              </ul>
              <p>
                <strong>Decision criteria:</strong>
              </p>
              <ul className="list">
                <li>
                  ✅ <strong>PASS</strong>: Clear history of resilience; strong founder relationship;
                  high self-awareness.
                </li>
                <li>
                  ⚠️ <strong>CONCERN</strong>: Limited exposure to hard situations; motivation is
                  mostly financial.
                </li>
                <li>
                  ❌ <strong>FAIL</strong>: Externalizes blame; unclear why they care about this
                  specific problem; fragile founder dynamics.
                </li>
              </ul>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">VII. The Decisive Questions & Scoring Model</summary>
            <div className="faq-answer">
              <p>
                Jeff distills the whole conversation into three decisive questions and a scoring
                sheet.
              </p>
              <ol className="list">
                <li>
                  <strong>The Crisis Test</strong> – “It’s Month 8. You’re behind on product and
                  design partners; burn is higher than planned. What do you do?”
                </li>
                <li>
                  <strong>The Truth-Telling Test</strong> – “When was the last time you shared
                  really bad news with a boss/investor? How did you do it?”
                </li>
                <li>
                  <strong>The Why-You Test</strong> – “In 18 months there will be 5–10 competitors.
                  Why do you win?”
                </li>
              </ol>

              <p>
                <strong>Summary assessment table:</strong>
              </p>
              <table className="table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>Weight</th>
                    <th>Score (1–5)</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Technical Credibility</td>
                    <td>25%</td>
                    <td></td>
                    <td>Can they build the platform?</td>
                  </tr>
                  <tr>
                    <td>Enterprise Sales Muscle</td>
                    <td>25%</td>
                    <td></td>
                    <td>Can they navigate enterprise buying?</td>
                  </tr>
                  <tr>
                    <td>Domain Authority</td>
                    <td>15%</td>
                    <td></td>
                    <td>Will buyers believe them?</td>
                  </tr>
                  <tr>
                    <td>Execution Capability</td>
                    <td>15%</td>
                    <td></td>
                    <td>Will they do the grind work?</td>
                  </tr>
                  <tr>
                    <td>Capital Discipline</td>
                    <td>10%</td>
                    <td></td>
                    <td>Will they stretch the dollars?</td>
                  </tr>
                  <tr>
                    <td>Founder Resilience</td>
                    <td>10%</td>
                    <td></td>
                    <td>Can they survive the valley?</td>
                  </tr>
                </tbody>
              </table>
              <p className="muted">
                4.0+ → strong conviction; 3.5–4.0 → conditional; 3.0–3.5 → revisit with traction;
                &lt;3.0 → pass.
              </p>
            </div>
          </details>

          <details className="faq-item">
            <summary className="faq-question">Red Flags & Next Steps</summary>
            <div className="faq-answer">
              <p>
                Jeff is explicit about what ends diligence early and what happens if you pass the
                bar.
              </p>
              <p>
                <strong>Red flags that kill the deal:</strong>
              </p>
              <ul className="list">
                <li>Cannot explain core technical architecture with depth.</li>
                <li>Zero enterprise sales experience; expects product to sell itself.</li>
                <li>No warm paths to target customers; design partner plan is vague.</li>
                <li>Founder compensation &gt;$150K at pre-revenue stage.</li>
                <li>Externalizes blame for failures; no resilience evidence.</li>
                <li>Unclear why they personally need to build this.</li>
                <li>Believes $2.5M automatically gets to Series A.</li>
                <li>Founder relationship feels fragile or decision-making unclear.</li>
              </ul>
              <p>
                <strong>If diligence goes well, next steps:</strong>
              </p>
              <ul className="list">
                <li>Reference calls with former colleagues, reports, managers.</li>
                <li>Back-channel with potential customers (CISOs in target verticals).</li>
                <li>Technical deep-dive with identity/policy experts.</li>
                <li>Term sheet discussion: milestones, structure, follow-on commitments.</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </SectionFrame>
  )
}

function DeckSection() {
  return (
    <SectionFrame id="deck" kicker="13" title="Slide deck outline (20 slides)">
      <div className="grid-2">
        <div>
          <ol className="list">
            <li>Title – NeuroAudit: AI Agent Governance for Regulated Industries</li>
            <li>Opening hook – “Who is watching your AI agents?”</li>
            <li>Market shift – AI agents moving into core workflows</li>
            <li>Problem – lack of observability, guardrails, and auditability</li>
            <li>Regulatory backdrop – EU AI Act and emerging rules</li>
            <li>Solution overview – NeuroAudit control plane</li>
            <li>Product tour – activity log, policies, approvals, simulation</li>
            <li>Demo storyline – refund guardrail and simulation</li>
            <li>Customer profiles & early use cases</li>
            <li>Business model – SaaS with per-agent pricing</li>
            <li>Market size – TAM / SAM / SOM</li>
            <li>Competitive landscape & positioning</li>
            <li>Go-to-market plan – design partners to enterprise scale</li>
            <li>Roadmap – product and platform expansion</li>
            <li>KPIs & high-level 3-year financials</li>
            <li>Team – why we are the right founders</li>
            <li>Moat – data, integrations, and policy engine</li>
            <li>Risks & how we de-risk them</li>
            <li>Vision – becoming the AI governance layer for the enterprise</li>
            <li>Ask & use of funds</li>
          </ol>
        </div>
        <div className="panel">
          <div className="metric-label">How to use this outline</div>
          <ul className="list">
            <li>Use each bullet as a single slide in Keynote/Google Slides/Figma.</li>
            <li>
              Pull text snippets from other sections of this SPA into the deck as speaker notes.
            </li>
            <li>
              Replace “Customer profiles” and “Team” slides with your real customers, logos, and
              founder story.
            </li>
          </ul>
        </div>
      </div>
    </SectionFrame>
  )
}

function ContactSection() {
  return (
    <SectionFrame id="contact" kicker="14" title="How to use this SPA with investors">
      <p>
        This site is intentionally built as a single-page React application so you can deploy it to
        Vercel, Netlify, or any static host and share a link with investors, partners, and friends.
      </p>
      <ul className="list">
        <li>Use it as a living memo – keep content in sync with your deck and financials.</li>
        <li>
          Let investors browse sections at their own pace, then walk through the site live on a
          call.
        </li>
        <li>
          Swap placeholder numbers, markets, and narratives with your actual data as you validate
          the idea.
        </li>
      </ul>
      <p className="muted">
        Implementation note: run <code>npm install</code> and <code>npm run dev</code> locally. Then
        push this folder to GitHub and connect it to Vercel for one-click deployment.
      </p>
    </SectionFrame>
  )
}
