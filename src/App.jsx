import React, { useEffect, useState } from 'react'

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
  { id: 'deck', label: 'Slide Outline' },
  { id: 'contact', label: 'How to Use This' },
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
              <div className="logo-tagline">AI agent security, governance & audit</div>
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
        <div className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
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
        action across their stack – before regulators, customers, or attackers do.
      </div>
      <div className="hero-cta-row">
        <button className="btn btn-primary" onClick={() => scrollToSection('memo')}>
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
              <strong>TAM:</strong> ~${'{'}25{'}'}B AI security/governance by 2030.
            </li>
            <li>
              <strong>SAM:</strong> ~${'{'}8{'}'}B focused on enterprises with live AI agents.
            </li>
            <li>
              <strong>SOM:</strong> ~${'{'}0.5{'}'}B reachable in fintech, banking, insurance, and
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
  const memoText = `
NeuroAudit – Investor Memo (draft)

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
• Achieve early ARR with strong expansion signals.
`
  return (
    <SectionFrame id="memo" kicker="09" title="Investor memo – narrative summary">
      <div className="memo-block">{memoText}</div>
    </SectionFrame>
  )
}

function DeckSection() {
  return (
    <SectionFrame id="deck" kicker="10" title="Slide deck outline (20 slides)">
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
    <SectionFrame id="contact" kicker="11" title="How to use this SPA with investors">
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
      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
        Implementation note: run <code>npm install</code> and <code>npm run dev</code> locally.
        Then push this folder to GitHub and connect it to Vercel for one-click deployment.
      </p>
    </SectionFrame>
  )
}
