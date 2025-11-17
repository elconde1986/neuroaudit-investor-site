import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from 'recharts'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution & Product' },
  { id: 'business-model', label: 'Business Model' },
  { id: 'market', label: 'Market & Competition' },
  { id: 'gtm', label: 'Go-To-Market' },
  { id: 'financials', label: 'Financials' },
  { id: 'playbooks', label: 'AI Governance Playbooks' },
  { id: 'memo', label: 'Investor Memo' },
  { id: 'jeff-view', label: 'The Jeff View' },
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

This lets CISOs protect critical workflows without introducing unacceptable latency or fragility.`
  },
  {
    question: '2. Intent Capture Mechanism',
    answer: `We support multiple ways to capture or infer intent:

• Modern agents: a lightweight SDK requires agents to emit structured intent (action, target, amount, user, risk context) before performing a system action.
• Legacy / opaque agents: proxy observers and structured parsing infer intent from outputs and API calls even if we don’t control source code.
• Multi-step / planning agents: we model intent as a sequence and link each step in the reasoning and execution chain.

We don’t need to read model internals — we govern behavior at the action level with rich contextual metadata.`
  },
  {
    question: '3. Brownfield Reality',
    answer: `We assume a messy AI estate with 200+ systems, ex-employees, and third-party SaaS.

Integration patterns:

• SDKs / middleware wrappers for in-house agents and orchestrators (LangChain, CrewAI, custom).
• API gateways / proxies for SaaS AI tools where we can observe and govern flows via APIs/webhooks.
• Low-code connectors into CRMs, ticketing, payments, and core systems.

The “14 hours per connector” estimate is incremental once base plumbing and patterns exist, not a promise to instrument an entire estate from scratch in that time.`
  },
  {
    question: '4. Meta-Governance Problem',
    answer: `NeuroAudit itself is treated as a high-value, privileged system:

• Isolated control plane, strong RBAC, hardened infra (VPC/VNet or on-prem options).
• Signed policy bundles so any tampering is detectable.
• Full self-audit: every administrative action is logged and evidence-chained.
• Customers can run NeuroAudit in a dedicated, private environment to minimize blast radius.

If an attacker targets NeuroAudit, they face a hardened surface, signed configs, and complete audit trails — which is far better than bespoke, scattered governance logic.`
  },
  {
    question: '5. Cryptographic Identity for Agents',
    answer: `“Cryptographic identity” is concrete:

• Agents get short-lived certificates or signed tokens from a non-human PKI.
• Identity lifecycle (issue, rotate, revoke) is programmatic and integrated into orchestration flows.
• Downstream systems expect NeuroAudit-verified identities, reducing impersonation risk.

We move away from untracked service accounts and static API keys toward time-bounded, traceable non-human identities.`
  },
  {
    question: '6. Evidence Immutability',
    answer: `We maintain a tamper-evident, cryptographically verifiable evidence ledger:

• Append-only log backed by Merkle trees; each record is hashed and chained.
• Every action, intent, and policy decision is signed and time-stamped.
• Evidence export and data sovereignty:
  – Logs can be exported to your archival / legal systems.
  – Storage can be pinned to specific jurisdictions to satisfy residency constraints.

Regulators, auditors, or legal teams can verify that the evidence has not been altered.`
  },
  {
    question: '7. Policy Configuration Burden',
    answer: `We designed the policy layer to avoid “rule swamp”:

• Policies are written in natural language and compiled into a deterministic DSL.
• We provide workflow-specific templates (e.g., refunds, PII access, credit changes) so teams don’t start from zero.
• Simulation runs policies against historical actions to expose conflicts and excessive false positives before enforcement.
• Policy ownership typically sits with security / risk teams, in partnership with AI platform teams.

Net effect: less configuration from scratch, fewer surprises in production, clearer accountability.`
  },
  {
    question: '8. Agent vs Workflow Confusion (Concept & Pricing)',
    answer: `We distinguish:

• Workflows: governed business processes (e.g., “refund > $500 with PII involvement”).
• Agents: runtime executors inside those workflows.

Governance attaches primarily to workflows, because that’s where business risk lives. Agents are metered as usage:

• Long-lived named agents billed individually.
• Ephemeral agent swarms billed via aggregate utilization rather than per-instance.

This keeps pricing predictable and aligned with business value, even when architectures are highly dynamic.`
  },
  {
    question: '9. Simulation Engine Reliability',
    answer: `Simulation doesn’t try to re-run the LLM; it re-runs policies:

• We replay stored intents and context through the policy engine deterministically.
• We do not re-sample model outputs — we use real historical actions and decisions.
• Drift detection looks at changing distributions (denies, escalations, risky actions) over time.

This approach avoids “random” simulations and focuses on policy correctness and drift, not pseudo-reproducing AI randomness.`
  },
  {
    question: '10. SIEM Integration vs Replacement',
    answer: `NeuroAudit is not a SIEM/SOAR replacement — it is a specialized evidence source:

• Streams structured AI governance events into Splunk, Sentinel, Chronicle, etc.
• SOC analysts continue working inside their existing SIEM console.
• SOAR tools can trigger incident response and automation based on NeuroAudit signals.

We reduce operational fragmentation by feeding richer AI context into systems teams already use, instead of trying to replace them.`
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

Even as firewalls “move downstream,” they are not built as unified behavioral governance platforms with identity, policy, simulation, and evidence in one place.`
  },
  {
    question: '12. Identity Platform Extension',
    answer: `Identity providers answer: “Who is this identity, and can they authenticate?”

NeuroAudit answers: “Given this identity (human or agent) and this context, should this specific action be allowed, escalated, or denied — and what is the evidence?”

We integrate with identity platforms:

• They manage access to systems.
• We govern behavior across those systems over time, with policy and proof.

The two are complementary, not substitutes.`
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

We are explicit: we support compliance with strong technical controls, but we are not a “magic compliance stamp.”`
  },
  {
    question: '14. SOC2 AI Addendum',
    answer: `SOC2 AI guidance is emerging, not final.

Our design principles:

• Align with core SOC2 themes (change management, logging, access control, segregation of duties) applied to AI workflows.
• Ensure our evidence model is flexible enough to map into whichever formal frameworks get standardized.

We do not invent proprietary “standards”; we make it easier for auditors to map NeuroAudit evidence to their control catalogs.`
  },
  {
    question: '15. Evidence in Legal/Regulatory Context',
    answer: `We design logs as potential legal evidence:

• Time-stamped, signed, chain-of-custody tracked.
• Exportable into e-discovery and legal archiving tooling.
• Access and changes to evidence are themselves logged.

We work with counsel and customer legal teams to ensure that log structure and chain-of-custody practices align with admissibility expectations, even though admissibility is always case- and jurisdiction-specific.`
  },
  {
    question: '16. Services Revenue Trap',
    answer: `Early on, deployments do include services:

• Workflow mapping, connector setup, policy modeling, simulation.

To avoid becoming a consulting company:

• We invest in reusable templates, connectors, and guided configuration.
• Partners (GRC firms, system integrators) take on more of the services load over time.
• Net-new workflow and customer deployments get progressively lighter.

By customer #10–#20, revenue mix tilts toward platform ARR with decreasing marginal services.`
  },
  {
    question: '17. Expansion Assumption',
    answer: `Workflows across regulated industries share a common grammar:

• Actor, asset, thresholds, approvals, risk scores, evidence.

NeuroAudit exploits that:

• Schemas and evidence models are reused across workflows.
                        • Only policy thresholds and context-specific conditions need tuning.

That is why expansion is not “rebuild everything per workflow,” but incremental configuration on top of a shared platform.`
  },
  {
    question: '18. Channel Complexity',
    answer: `Channel design:

• Partners receive attractive license and services margins, but not so high that they’re incented to re-build us.
• Core IP — behavioral ledger, policy compiler, simulation engine, non-human PKI — is technically deep and non-trivial.

We support partners with training, certification, and co-sell motions. They make money delivering NeuroAudit, not reinventing it.`
  },
  {
    question: '19. Platform Dependency Risk',
    answer: `We treat “what if you go away?” as a design requirement:

• Open, documented schemas for all evidence and logs.
• Reversible connectors and clean boundaries so customers retain control of their systems.
• Self-hosted or private-cloud deployment options for critical customers.
• Clear export paths for all data and configuration.

We are foundational — but not a black box or a one-way door.`
  },
  {
    question: '20. Acquisition Value vs Build',
    answer: `For platforms like Databricks, ServiceNow, Wiz, or hyperscalers:

• Building this internally requires cross-team coordination across security, observability, AI, and compliance product lines.
• Buying or partnering with a focused, adoption-proven governance stack is faster and cheaper.

Our long-term value is not “we were first,” but:
• Deep integration with AI workflows.
• A defensible behavioral ledger + policy + simulation stack.
• Embeddedness in regulated customer environments.`
  },
  {
    question: '21. The Synthesis Question – Irreducible Core',
    answer: `NeuroAudit’s irreducible core:

• Causally complete, cryptographically verifiable, real-time governance of AI system actions across heterogeneous agents and workflows.

No existing combination of SIEM, identity, logging, firewalls, and manual process:

• Unifies agent identity, intent, policy, actions, and evidence into a single chain.
• Lets you simulate and test policies across all that behavior.
• Does so in a vendor-neutral way across multiple AI and systems stacks.

That unified behavioral control plane is what justifies introducing NeuroAudit as a foundational layer.`
  }
]

const competitionPositions = [
  // NeuroAudit – keep this as the hero (purple)
  { name: 'NeuroAudit', x: 9, y: 9, isNeuro: true },

  // Competitors – each with its own color
  {
    name: 'Astrix',
    x: 3,
    y: 8,
    isNeuro: false,
    color: '#f97316',      // orange
    stroke: '#c2410c',
  },
  {
    name: 'Noma',
    x: 4,
    y: 7,
    isNeuro: false,
    color: '#10b981',      // emerald
    stroke: '#047857',
  },
  {
    name: 'Zenity',
    x: 5,
    y: 6,
    isNeuro: false,
    color: '#0ea5e9',      // sky
    stroke: '#0369a1',
  },
  {
    name: 'Credo AI',
    x: 7,
    y: 5,
    isNeuro: false,
    color: '#e11d48',      // rose
    stroke: '#9f1239',
  },
  {
    name: 'Holistic AI',
    x: 7,
    y: 4,
    isNeuro: false,
    color: '#22c55e',      // green
    stroke: '#15803d',
  },
  {
    name: 'Securiti AI',
    x: 8,
    y: 4,
    isNeuro: false,
    color: '#a855f7',      // violet
    stroke: '#7e22ce',
  },
]



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
              <div className="logo-tagline">AI agent security, governance &amp; audit</div>
            </div>
          </div>
          <nav className="nav">
            <div className="nav-section-label">INVESTOR BRIEF</div>
            {sections.map((s) => (
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
          <PlaybooksSection />
          <MemoSection />
          <JeffViewSection />
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
        AI security &amp; governance for the agent era
      </div>
      <div className="hero-title">The control plane for AI agents in regulated industries.</div>
      <div className="hero-subtitle">
        NeuroAudit gives enterprises a single place to monitor, govern, and audit every AI-driven
        action across their stack – before regulators, customers, or attackers do. For a hard-nosed,
        operator view of the business, see <strong>The Jeff View</strong> below.
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
            <div className="metric-caption">Where AI is live &amp; regulators are watching.</div>
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
    <SectionFrame id="solution" kicker="03" title="Solution &amp; product – The AI agent control plane">
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
    <SectionFrame id="market" kicker="05" title="Market &amp; competition">
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
              <strong>SOM:</strong> ~$0.5B reachable in fintech, banking, insurance, and
              SaaS in the next 3–5 years.
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
              <strong>Phase 2 – mid-market &amp; enterprise sales:</strong> direct outreach to CISOs,
              Chief Risk Officers, and Heads of AI/ML &amp; Platform Engineering.
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
              Net dollar retention driven by adding workflows, agents, environments, and
              compliance modules.
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

function PlaybooksSection() {
  return (
    <SectionFrame id="playbooks" kicker="08" title="AI governance playbooks – concrete workflows">
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
              <strong>Access &amp; permissions:</strong> “Temporary access grants must expire and be
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
    <SectionFrame id="memo" kicker="09" title="Investor memo – narrative summary">
      <div className="memo-block">{memoText}</div>
    </SectionFrame>
  )
}

const renderScatterPoint = (props) => {
  const { cx, cy, payload } = props
  const isNeuro = payload?.isNeuro

  const fill = isNeuro
    ? '#4f46e5' // NeuroAudit – indigo
    : payload?.color || '#9ca3af' // fallback gray if no color

  const stroke = isNeuro
    ? '#312e81'
    : payload?.stroke || '#6b7280'

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={cx + 8}
        y={cy - 6}
        fontSize={10}
        fill="#0f172a"
      >
        {payload?.name}
      </text>
    </g>
  )
}



function JeffViewSection() {
  return (
    <SectionFrame id="jeff-view" kicker="10" title="The Jeff View – Hard Questions &amp; Answers">
      <div className="grid-2">
        <div>
          <p>
            This section structures the NeuroAudit plan the way Jeff likes to evaluate companies:
            clear platform definition, buyer clarity, build-vs-buy reality, competitive moat,
            timing, a full CISO due-diligence Q&amp;A, and a concrete plan for how seed money,
            milestones, PMF, team, and GTM fit together.
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
            <li><strong>Identity</strong> – cryptographic identities for non-human agents.</li>
            <li><strong>Intent</strong> – structured capture/inference of what an agent is trying to do.</li>
            <li><strong>Policy</strong> – natural-language rules compiled to a deterministic DSL.</li>
            <li><strong>Action</strong> – inline governance of system-level actions (refunds, credit, PII, access).</li>
            <li><strong>Evidence</strong> – append-only, verifiable behavioral ledger for regulators and auditors.</li>
          </ul>

          <h3 className="subheading">2. Who Actually Buys?</h3>
          <p>
            The buyer stack is explicit:
          </p>
          <ul className="list">
            <li><strong>CISO</strong> – primary economic buyer; owns AI risk and security posture.</li>
            <li><strong>Head of AI / Platform Engineering</strong> – technical champion and implementer.</li>
            <li><strong>CRO / Compliance</strong> – economic influencer focused on evidence &amp; controls.</li>
          </ul>

          <h3 className="subheading">3. How Do They Solve It Today?</h3>
          <p>
            Today’s reality is a patchwork: SIEM logs, prompt security tools, homegrown scripts,
            Slack approvals, and CSV exports. These are:
          </p>
          <ul className="list">
            <li><strong>Incomplete</strong> – no unified view of AI behavior across workflows.</li>
            <li><strong>Unverifiable</strong> – no cryptographic integrity or chain-of-custody.</li>
            <li><strong>Non-deterministic</strong> – policies exist in docs, not in code.</li>
            <li><strong>Non-compliant</strong> – difficult to defend under AI Act / SOC2 / ISO 42001.</li>
          </ul>

          <h3 className="subheading">4. Build vs Buy – Can They Just Build It?</h3>
          <p>
            Jeff’s CFO lens: “If I can build this cheaper internally, your deal dies.”
          </p>
          <p>
            To replicate NeuroAudit, an enterprise must build:
          </p>
          <ul className="list">
            <li>Non-human identity / PKI and lifecycle management for agents.</li>
            <li>Intent capture and normalization across multiple agent frameworks.</li>
            <li>A behavioral telemetry stack that spans tools, APIs, and vendors.</li>
            <li>An inline policy engine with NL→DSL compilation and real-time enforcement.</li>
            <li>An immutable, cryptographically verifiable evidence ledger.</li>
            <li>A simulation and drift detection engine tuned for agent behavior.</li>
          </ul>
          <p>
            Realistic cost: <strong>6–10 engineers × 12–18 months = $3.6M–$6.2M</strong> plus ongoing maintenance.
            NeuroAudit typically lands at <strong>$180K–$480K/year</strong> for a serious deployment.
          </p>

          <h3 className="subheading">5. Why Won’t Big Vendors Crush This?</h3>
          <p>
            Jeff&apos;s competitive question: “Why wouldn&apos;t Microsoft, Google, or Palo Alto just ship this?”
          </p>
          <p>
            Our moat is depth + neutrality:
          </p>
          <ul className="list">
            <li>Neutral across OpenAI, Anthropic, local models, custom agents, SaaS AI.</li>
            <li>Behavioral ledger purpose-built for AI actions, not generic logs.</li>
            <li>NL→DSL policy compiler wired to AI workflows and systems of record.</li>
            <li>Non-human PKI and lifecycle management for agents.</li>
            <li>Simulation engine focused on agent behavior and policy drift.</li>
            <li>Vertical templates and compliance packs for regulated workflows.</li>
          </ul>

          <h3 className="subheading">6. Why Now?</h3>
          <p>
            Timing is driven by regulation and real incidents:
          </p>
          <ul className="list">
            <li>EU AI Act enforcement windows arriving for high-risk systems.</li>
            <li>Emerging SOC2 AI and ISO/IEC 42001 frameworks.</li>
            <li>AI-caused financial, data, and reputational incidents appearing in the wild.</li>
            <li>Explosion of multi-agent architectures acting on real systems, not just chat.</li>
            <li>Boards and regulators asking: “What are your AI agents doing, and how do you prove it?”</li>
          </ul>

          <h3 className="subheading">7. Competitive Landscape – Startups &amp; Vendors</h3>
          <p>
            How NeuroAudit sits relative to current AI governance / security players Jeff will ask about:
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
                    Focuses on agent and SaaS security posture. NeuroAudit goes deeper on
                    per-action policy decisions, approvals, simulation, and auditor-grade evidence
                    for regulated workflows.
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
                    what agents actually do to systems (refunds, credit changes, PII exports, access)
                    and proving it for auditors and regulators.
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
              secures the <em>actions</em> AI agents take in your production systems — tying identity,
              intent, policy, execution, and evidence into a single control plane.
            </p>

            {/* Real 2×2 scatter chart using Recharts */}
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
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Breadth"
                      domain={[0, 10]}
                      tickCount={6}
                    >
                      <Label value="Breadth across AI & systems" position="bottom" style={{ fontSize: 11 }} />
                    </XAxis>
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Depth"
                      domain={[0, 10]}
                      tickCount={6}
                    >
                      <Label
                        value="Depth of action governance"
                        angle={-90}
                        position="insideLeft"
                        style={{ textAnchor: 'middle', fontSize: 11 }}
                      />
                    </YAxis>
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(_, __, item) => item && item.payload && item.payload.name}
                      labelFormatter={() => ''}
                    />
                    <Scatter
  data={competitionPositions}
  name="Vendors"
  shape={renderScatterPoint}
/>


                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <ul className="list" style={{ marginTop: 6 }}>
                <li><strong>Top-right:</strong> NeuroAudit – deep action governance, broad across stacks.</li>
                <li><strong>Top-left:</strong> Deep but narrow (e.g., Astrix on identity).</li>
                <li><strong>Bottom-right:</strong> Broad but shallow (suites that touch many surfaces but not deeply at action level).</li>
                <li><strong>Bottom-left:</strong> Early or point tools – shallow &amp; narrow.</li>
              </ul>
            </div>
          </div>

          {/* 8. Seed Round Use of Funds & Milestones */}
          <h3 className="subheading" style={{ marginTop: 24 }}>8. Seed Round Use of Funds &amp; Milestones</h3>
          <p>
            Jeff wants to see every dollar tied directly to milestones. Assuming a{' '}
            <strong>$2.5M seed round</strong>, the use of funds looks like:
          </p>
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>%</th>
                <th>$ Amount</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Engineering</td>
                <td>45%</td>
                <td>~$1.125M</td>
                <td>Core platform: identity, intent ingestion, policy engine, ledger, connectors</td>
              </tr>
              <tr>
                <td>Founder Salaries + Ops</td>
                <td>15%</td>
                <td>~$375K</td>
                <td>Minimal salaries, legal, admin, compliance</td>
              </tr>
              <tr>
                <td>Design Partner Deployments</td>
                <td>10%</td>
                <td>~$250K</td>
                <td>Onsite integration, workflows, connectors, feedback loops</td>
              </tr>
              <tr>
                <td>Compliance &amp; Security</td>
                <td>5%</td>
                <td>~$125K</td>
                <td>Pen tests, SOC2 readiness, audits, infra hardening</td>
              </tr>
              <tr>
                <td>GTM / Early Sales</td>
                <td>15%</td>
                <td>~$375K</td>
                <td>AE, fractional CISO advisor, marketing &amp; sales assets</td>
              </tr>
              <tr>
                <td>Cloud / Infra</td>
                <td>5%</td>
                <td>~$125K</td>
                <td>Simulation, event ingestion, staging &amp; testing environments</td>
              </tr>
              <tr>
                <td>Contingency</td>
                <td>5%</td>
                <td>~$125K</td>
                <td>Runway buffer / risk cushion</td>
              </tr>
            </tbody>
          </table>

          <p><strong>Milestones:</strong></p>
          <ul className="list">
            <li>
              <strong>Milestone 1 (0–6 months) – Platform Core MVP:</strong> identity, intent ingestors, policy engine v1, evidence ledger, console v1.  
              <br />✅ 1 design partner live, 1 governed workflow, &lt; 30 days to first value.
            </li>
            <li>
              <strong>Milestone 2 (6–12 months) – Workflow Depth + Integrations:</strong> 10+ connectors, simulation v1, audit exports, SSO &amp; RBAC.  
              <br />✅ 3–5 design partners, first paying customer, increasing workflow coverage.
            </li>
            <li>
              <strong>Milestone 3 (12–24 months) – Commercial Readiness:</strong> connector marketplace, drift detection, partner playbooks.  
              <br />✅ $1M+ ARR, repeatable deployments, growing enterprise pipeline.
            </li>
          </ul>

          {/* 9. Product-Market Fit Strategy */}
          <h3 className="subheading">9. How We Find Product-Market Fit</h3>
          <p>
            Jeff cares about a disciplined PMF search, not vibes. The PMF strategy is explicit:
          </p>
          <ul className="list">
            <li>
              <strong>Start with “hot pain”:</strong> workflows where AI is already acting on money,
              PII, customers, or production systems — and where CISOs already feel audit and board pressure.
            </li>
            <li>
              <strong>Wedge use cases:</strong> one workflow per customer (refund guardrails, PII exports,
              credit limit changes, HR access) that we can govern in &lt; 30 days.
            </li>
            <li>
              <strong>Design partner loop:</strong> map the workflow → govern it → prove value →
              expand → convert to paid → capture logos and references.
            </li>
          </ul>
          <p><strong>PMF metrics Jeff will like:</strong></p>
          <ul className="list">
            <li>50+ governed agent actions per day per customer.</li>
            <li>Workflows per customer expanding quarter over quarter.</li>
            <li>CISOs explicitly referencing NeuroAudit in AI risk / board decks.</li>
            <li>Willingness-to-pay in the $100–$150/agent range for high-risk workflows.</li>
          </ul>

          {/* 10. Team Shape */}
          <h3 className="subheading">10. Team – Seed &amp; Post-Seed Shape</h3>
          <p>
            Instead of a bloated org chart, Jeff wants to see a lean, execution-focused team.
          </p>
          <p><strong>Seed team (0–12 months, 6–8 people):</strong></p>
          <ul className="list">
            <li>2–3 founders – architecture, customer integration, product direction.</li>
            <li>2 backend engineers – policy engine, ledger, simulation core.</li>
            <li>1 integrations engineer – connectors into CRM, ticketing, payments, PII systems.</li>
            <li>1 fullstack engineer – console UI, timelines, approvals, visualizations.</li>
            <li>Fractional CISO – narrative, credibility, security reviews.</li>
            <li>1 PM / chief-of-staff type – prioritization, customer feedback loops.</li>
            <li>1 AE – added only once 2–3 design partners are live.</li>
          </ul>
          <p><strong>Post-seed (12–24 months, 10–14 people):</strong></p>
          <ul className="list">
            <li>Additional integrations &amp; simulation engineers.</li>
            <li>Compliance specialist to harden AI Act / SOC2 / ISO mappings.</li>
            <li>Partner manager for GRC firms and integrators.</li>
            <li>Sales engineer to support complex POCs.</li>
          </ul>

          {/* 11. If Capital Were Not a Constraint */}
          <h3 className="subheading">11. If Money Were Not a Constraint – GTM Acceleration</h3>
          <p>
            Jeff&apos;s “what if capital isn&apos;t the bottleneck?” question is about ambition. With a
            much larger war chest (e.g., $10M+), GTM changes meaningfully:
          </p>
          <ul className="list">
            <li>
              <strong>GTM talent:</strong> full enterprise sales pod per region (AE + SE + SDR),
              plus VP Sales and GTM Ops earlier in the journey.
            </li>
            <li>
              <strong>Verticalization:</strong> parallel AI governance packs for fintech, insurance,
              healthcare, and eCommerce instead of one-at-a-time.
            </li>
            <li>
              <strong>Partner-first motion:</strong> certification programs for GRC consultancies,
              co-sell with cloud providers, rev-share with integrators, deployment accelerators.
            </li>
            <li>
              <strong>Brand &amp; trust:</strong> early analyst relations, CISO councils, events, and
              accelerated SOC2 / ISO / AI governance certifications.
            </li>
          </ul>
          <p>
            The goal with more capital is not to burn recklessly, but to <strong>own the category
            before the market fully hardens</strong> — to become the default “agent governance
            layer” in the same way that Datadog became the default for observability.
          </p>
        </div>

        <div className="panel" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="metric-label">CISO Due-Diligence FAQ (21 Qs)</div>
          <div className="metric-caption" style={{ marginBottom: 12 }}>
            The following questions and answers map directly to how a skeptical CISO or CIO would
            interrogate NeuroAudit before approving a deployment.
          </div>

          <div className="faq-list">
            {jeffFaqs.map((item, idx) => (
              <details
                key={idx}
                className="faq-item"
                open={idx < 2}
              >
                <summary className="faq-question">
                  {item.question}
                </summary>
                <p className="faq-answer">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </SectionFrame>
  )
}

function DeckSection() {
  return (
    <SectionFrame id="deck" kicker="11" title="Slide deck outline (20 slides)">
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
            <li>Customer profiles &amp; early use cases</li>
            <li>Business model – SaaS with per-agent pricing</li>
            <li>Market size – TAM / SAM / SOM</li>
            <li>Competitive landscape &amp; positioning</li>
            <li>Go-to-market plan – design partners to enterprise scale</li>
            <li>Roadmap – product and platform expansion</li>
            <li>KPIs &amp; high-level 3-year financials</li>
            <li>Team – why we are the right founders</li>
            <li>Moat – data, integrations, and policy engine</li>
            <li>Risks &amp; how we de-risk them</li>
            <li>Vision – becoming the AI governance layer for the enterprise</li>
            <li>Ask &amp; use of funds</li>
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
    <SectionFrame id="contact" kicker="12" title="How to use this SPA with investors">
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
        Implementation note: run <code>npm install</code> and <code>npm run dev</code> locally.
        Then push this folder to GitHub and connect it to Vercel for one-click deployment.
      </p>
    </SectionFrame>
  )
}
