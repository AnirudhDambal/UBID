export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2ea] text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-[#f7b385]/45 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-[#7dd3c7]/45 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.06),transparent_45%,rgba(15,23,42,0.08))]" />
      </div>

      <div className="relative">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-950 text-slate-50 grid place-items-center text-sm font-semibold">
              UB
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">UBID Platform</p>
              <p className="text-lg font-semibold">Universal Business Identity</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a className="hover:text-slate-900" href="#product">Product</a>
            <a className="hover:text-slate-900" href="#pipeline">Pipeline</a>
            <a className="hover:text-slate-900" href="#security">Security</a>
            <a className="hover:text-slate-900" href="#cta">Get started</a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              className="hidden rounded-full border border-slate-300/80 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 md:inline-flex"
              href="/login"
            >
              View demo
            </a>
            <a
              className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-slate-50 shadow-lg shadow-slate-950/20 hover:bg-slate-900"
              href="/dashboard/ingest"
            >
              Start ingestion
            </a>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-16 pt-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live pipeline ready
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
              Resolve every business entity into one trusted identity.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              UBID connects messy registry data, normalizes records, scores matches, and
              delivers review-ready decisions in minutes. Built for compliance teams and
              analysts who need answers fast.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-50 shadow-xl shadow-slate-950/20 hover:bg-slate-900"
                href="/dashboard/ingest"
              >
                Launch ingestion wizard
              </a>
              <a
                className="rounded-full border border-slate-300/80 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400"
                href="/login"
              >
                See the dashboard
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
                <p className="text-sm text-slate-500">Average pipeline run</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">2m 18s</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
                <p className="text-sm text-slate-500">Auto-merged rate</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">71%</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
                <p className="text-sm text-slate-500">Active UBIDs</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">1,847</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 h-32 w-32 rounded-full border border-slate-200/70 bg-white/80 shadow-sm" />
            <div className="absolute -right-6 bottom-12 h-24 w-24 rounded-3xl border border-slate-200/70 bg-white/90 shadow-sm" />
            <div className="relative rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_35px_90px_rgba(15,23,42,0.18)]">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                <span>Pipeline console</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Running</span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  "Connect source",
                  "Detect schema",
                  "Normalize fields",
                  "Score matches",
                  "Queue review",
                  "Publish UBIDs",
                ].map((step, index) => (
                  <div
                    className={`flex items-center justify-between rounded-2xl border border-slate-200/70 px-4 py-3 text-sm font-medium ${
                      index === 3
                        ? "bg-slate-950 text-slate-50"
                        : "bg-white/70 text-slate-700"
                    }`}
                    key={step}
                  >
                    <span>{step}</span>
                    <span className={index === 3 ? "text-emerald-300" : "text-emerald-500"}>
                      {index < 3 ? "Done" : index === 3 ? "Scoring" : "Queued"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-950 px-5 py-4 text-slate-50">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Match summary</p>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Auto-merged</p>
                    <p className="mt-1 text-lg font-semibold">96</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Queued</p>
                    <p className="mt-1 text-lg font-semibold">18</p>
                  </div>
                  <div>
                    <p className="text-slate-400">New UBIDs</p>
                    <p className="mt-1 text-lg font-semibold">143</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/70 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Latest record</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Sharma Foods Pvt Ltd</p>
                  <p>GSTIN: 29AABCS1234H1Z4</p>
                  <p>Pincode: 560102</p>
                  <p className="text-emerald-600">Confidence: 0.92</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Schema-aware ingestion",
                desc: "Detect tables, flag PII, and map fields with guardrails that keep teams aligned.",
              },
              {
                title: "Entity resolution engine",
                desc: "Block, score, and decide with explainable confidence. Every decision lands in the audit log.",
              },
              {
                title: "Review queue built-in",
                desc: "Side-by-side evidence, reasoned actions, and instant pipeline feedback in one flow.",
              },
            ].map((item) => (
              <div
                className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-sm"
                key={item.title}
              >
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pipeline" className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  End-to-end flow
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  From raw sources to publishable UBIDs
                </h2>
              </div>
              <a
                className="rounded-full border border-slate-300/80 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                href="/dashboard/ingest"
              >
                Run a live pipeline
              </a>
            </div>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { step: "Connect", desc: "Validate source credentials and ingest schema." },
                { step: "Normalize", desc: "Clean, canonicalize, and FPE-scramble sensitive fields." },
                { step: "Score", desc: "Compute match probabilities using weighted signals." },
                { step: "Decide", desc: "Auto-merge high confidence matches, queue the rest." },
                { step: "Review", desc: "Human-in-the-loop decisions with evidence trails." },
                { step: "Publish", desc: "Write UBIDs back to registry with audit history." },
              ].map((item) => (
                <li className="rounded-2xl border border-slate-200/70 bg-white/70 p-5" key={item.step}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {item.step}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="security" className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/80 bg-white/70 p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Compliance built-in
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                Audit-ready decisions with role-based access.
              </h2>
              <p className="mt-4 text-sm text-slate-600">
                Every match, merge, and manual action writes to the append-only audit log. Roles
                control who can ingest, who can approve, and who can export.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Audit trace
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Every decision is logged with time, user, and reason.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    FPE preview
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Preview sanitized data before the pipeline runs.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Role-based UI
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Auditors and reviewers see only the tools they need.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Export controls
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Secure CSV export with reason codes and approvals.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-slate-950 p-8 text-slate-50 shadow-[0_35px_90px_rgba(15,23,42,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Readiness snapshot
              </p>
              <h3 className="mt-3 text-xl font-semibold">Today in the registry</h3>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/70 px-4 py-3">
                  <span>Active UBIDs</span>
                  <span className="font-semibold">1,847</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/70 px-4 py-3">
                  <span>Pending reviews</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/70 px-4 py-3">
                  <span>Model precision</span>
                  <span className="font-semibold">99.2%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/70 px-4 py-3">
                  <span>Audit logs written</span>
                  <span className="font-semibold">8,492</span>
                </div>
              </div>
              <a
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
                href="/login"
              >
                Open the review queue
              </a>
            </div>
          </div>
        </section>

        <section id="cta" className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="rounded-[2.5rem] border border-slate-200/80 bg-white/80 p-10 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Ready to ship
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                  Turn duplicate records into trusted UBIDs in one sprint.
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  Start with the ingestion wizard, then track every decision through the pipeline.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-900"
                  href="/dashboard/ingest"
                >
                  Start ingestion
                </a>
                <a
                  className="rounded-full border border-slate-300/80 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400"
                  href="/login"
                >
                  View demo login
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
