export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary),transparent_55%)] opacity-10" />
      </div>

      <div className="relative">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-foreground text-background grid place-items-center text-sm font-semibold">
              UB
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">UBID Platform</p>
              <p className="text-lg font-semibold">Universal Business Identity</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a className="hover:text-foreground" href="#product">Product</a>
            <a className="hover:text-foreground" href="#pipeline">Pipeline</a>
            <a className="hover:text-foreground" href="#security">Security</a>
            <a className="hover:text-foreground" href="#cta">Get started</a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent md:inline-flex"
              href="/login"
            >
              View demo
            </a>
            <a
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
              href="/dashboard/ingest"
            >
              Start ingestion
            </a>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-16 pt-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live pipeline ready
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Resolve every business entity into one trusted identity.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              UBID connects messy registry data, normalizes records, scores matches, and
              delivers review-ready decisions in minutes. Built for compliance teams and
              analysts who need answers fast.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90"
                href="/dashboard/ingest"
              >
                Launch ingestion wizard
              </a>
              <a
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent"
                href="/login"
              >
                See the dashboard
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card/50 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Average pipeline run</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">2m 18s</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/50 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Auto-merged rate</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">71%</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/50 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Active UBIDs</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">1,847</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 h-32 w-32 rounded-full border border-border bg-card/40 shadow-sm" />
            <div className="absolute -right-6 bottom-12 h-24 w-24 rounded-3xl border border-border bg-card/50 shadow-sm" />
            <div className="relative rounded-3xl border border-border bg-card/80 p-6 shadow-[0_35px_90px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                <span>Pipeline console</span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-500">Running</span>
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
                    className={`flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium ${
                      index === 3
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/50 text-foreground"
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
              <div className="mt-6 rounded-2xl border border-border bg-background px-5 py-4 text-foreground">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Match summary</p>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Auto-merged</p>
                    <p className="mt-1 text-lg font-semibold">96</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Queued</p>
                    <p className="mt-1 text-lg font-semibold">18</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">New UBIDs</p>
                    <p className="mt-1 text-lg font-semibold">143</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-border bg-card/70 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Latest record</p>
                <div className="mt-3 grid gap-2 text-sm text-foreground">
                  <p className="font-semibold">Sharma Foods Pvt Ltd</p>
                  <p>GSTIN: 29AABCS1234H1Z4</p>
                  <p>Pincode: 560102</p>
                  <p className="text-emerald-500">Confidence: 0.92</p>
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
                className="rounded-3xl border border-border bg-card/50 p-6 shadow-sm"
                key={item.title}
              >
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pipeline" className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="rounded-3xl border border-border bg-card/50 p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  End-to-end flow
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  From raw sources to publishable UBIDs
                </h2>
              </div>
              <a
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-accent"
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
                <li className="rounded-2xl border border-border bg-card/30 p-5" key={item.step}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    {item.step}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="security" className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-border bg-card/50 p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Compliance built-in
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                Audit-ready decisions with role-based access.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Every match, merge, and manual action writes to the append-only audit log. Roles
                control who can ingest, who can approve, and who can export.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    Audit trace
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Every decision is logged with time, user, and reason.</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    FPE preview
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Preview sanitized data before the pipeline runs.</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    Role-based UI
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Auditors and reviewers see only the tools they need.</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    Export controls
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Secure CSV export with reason codes and approvals.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-foreground text-background p-8 shadow-[0_35px_90px_rgba(0,0,0,0.4)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Readiness snapshot
              </p>
              <h3 className="mt-3 text-xl font-semibold">Today in the registry</h3>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-background/10 px-4 py-3">
                  <span>Active UBIDs</span>
                  <span className="font-semibold">1,847</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-background/10 px-4 py-3">
                  <span>Pending reviews</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-background/10 px-4 py-3">
                  <span>Model precision</span>
                  <span className="font-semibold">99.2%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-background/10 px-4 py-3">
                  <span>Audit logs written</span>
                  <span className="font-semibold">8,492</span>
                </div>
              </div>
              <a
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                href="/login"
              >
                Open the review queue
              </a>
            </div>
          </div>
        </section>

        <section id="cta" className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="rounded-[2.5rem] border border-border bg-card/80 p-10 shadow-sm text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Ready to ship
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">
              Turn duplicate records into trusted UBIDs in one sprint.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto">
              Start with the ingestion wizard, then track every decision through the pipeline.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                className="rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                href="/dashboard/ingest"
              >
                Start ingestion
              </a>
              <a
                className="rounded-full border border-border px-8 py-4 text-sm font-semibold text-foreground hover:bg-accent"
                href="/login"
              >
                View demo login
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
