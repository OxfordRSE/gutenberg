# CHARTED funding ideas for Gutenberg / UNIVERSE-HPC

Gutenberg is an open-source training platform, developed by Oxford Research Software Engineering, that served over 25,000 unique visitors and 1,480 enrolled students across 62 training events in the past year alone (79,000+ pageviews, 13,000+ practice problems solved).

Brainstorm for two open CHARTED calls, deadline **30 Sept 2026**:

- **Fund 1 — FAIRifying Training Resources** ([funds-fair](https://drtp-skills.ac.uk/funds-fair/)): ≤£40k, 80% FEC, ≤12 months. Improves findability/accessibility/interoperability/reusability of existing training material and its metadata.
- **Fund 3 — Tools and Frameworks** ([funds-tools](https://drtp-skills.ac.uk/funds-tools/)): small ≤£15k / large ≤£150k, 80% FEC, ≤12 months. Builds tools/frameworks that help people navigate the dRTP training ecosystem.

Both funds require open, FAIR outputs and contributions to the CHARTED hub (project description, ≥1 blog post, shared outputs, end-of-project report). Neither covers equipment costs; both run through the Good Grants platform and are judged on soundness, delivery capability, and ecosystem impact; all work must conclude by 30 March 2029 regardless of round.

Every idea below builds on infrastructure that already exists, not a green-field claim: a front-matter schema (`name`, `id`, `dependsOn`, `tags`, `files`, `attribution`, `learningOutcomes`) validated in CI; a **material dependency graph** (`dependsOn`) that drives navigation already; support for **multiple institutions' material repos** as sources (only `UNIVERSE-HPC/course-material` is wired up today); per-user **progress tracking**; and 209 sections across 46 courses, organised into 9 categories.

## Grounding facts, checked directly against the calls and both repos

- **No skills/role framework is mandated by CHARTED.** Its "map the landscape of dRTP skills, roles and training content" framing is an invitation to connect *existing* efforts (SFIA, Vitae RDF, etc.), not a recommendation of one — present any chosen framework as a contribution, not "the" CHARTED standard.
- **CHARTED does specify a metadata standard**: the **RDA minimum metadata schema**, and cites the **ELIXIR FAIR Training Handbook** as its own precedent for FAIR-training guidance documents. Tracked to its actual source: it's ["Recommendations for a minimal metadata set to aid harmonised discovery of learning resources"](https://zenodo.org/records/6769695) (RDA Education and Training on Handling of Research Data IG, June 2022) — 14 named fields (Title, Abstract/Description, Author(s), Primary Language, Keyword(s), License, Version Date, URL to Resource, Resource URL Type, Target Group, Learning Resource Type, Learning Outcome(s), Access Cost, Expertise Level). Two of those fields map directly onto ideas already in this doc — "Learning Outcome(s)" onto idea #8, and "URL to Resource"/"Resource URL Type" (which explicitly expects a persistent-identifier-typed URL, not a plain link) onto idea #7 — which is a much stronger grounding than "conforms to some RDA schema" in the abstract. It does **not** define a skills/competency field, so idea #1's crosswalk is not itself an RDA-schema activity — don't conflate the two.
- **CHARTED's FAIR Training Evaluation Service** (~50 yes/no questions, auto-emailed report, adapted from the Software Sustainability Institute's methodology) is live today. Its question set was extracted and self-scored against this repo below without submitting a response — see the table further down.
- **Gutenberg is already named CHARTED-adjacent infrastructure.** The sibling **DRIFT** project (same programme, same UNIVERSE-HPC partners) commits to "extending and improving the open-source Gutenberg training platform." Three open, `DRIFT`-tagged Gutenberg issues overlap ideas in this doc directly: [#193](https://github.com/OxfordRSE/gutenberg/issues/193) (WCAG automation → Fund 1 #3), [#478](https://github.com/OxfordRSE/gutenberg/issues/478) ("Prereqs" → Fund 3 #1), [#484](https://github.com/OxfordRSE/gutenberg/issues/484) ("Outcomes to badges" → Fund 3 #6, and confirms Fund 1 #8 as its own blocker). Each affected idea below is flagged and reframed rather than left as a silent collision.
- **The material repo is under active, current revision**, not a static snapshot — `git log` shows `high_performance_computing/supercomputing` was rewritten within the last day, sitting inside a larger open restructuring effort (a ten-issue `[revamp]` epic, plus #208/#269). File-level examples here are a snapshot; re-check before drafting an actual application. This is also independent, current evidence for Fund 1 idea #9.
- **`dependsOn` already *is* one of Fund 3's own named example tools** ("prerequisites-to-training-resources linking systems") — any Fund 3 application should open with "we already operate one," not "we will build one."
- **Application mechanics**: applicants improving existing resources are "encouraged to use" CHARTED's evaluation tool (already done, below); the application template differs for course-improvement vs. guidance/resource projects — pick the right one early.
- **Steer for this doc: our ecosystem first.** Ideas are ranked and framed by how much they improve Gutenberg and HPCu specifically, not by how much they help the wider dRTP community — even where that trades off against call-fit. Ideas whose main value is helping *other* institutions/providers (a template for external adopters, an embeddable tool for other providers' catalogues, a cross-provider recommender) are flagged as lower priority below despite sometimes scoring well against the call text. The skills-framework crosswalk (idea 1) is framed the same way: primarily to help our own learners see what a course teaches and our own maintainers spot curriculum gaps, not to help outsiders discover UNIVERSE-HPC material via an SFIA lens — that's a secondary, incidental benefit at most.

### Open issues checked against both repos

Scanned all open issues in `OxfordRSE/gutenberg` (43) and `UNIVERSE-HPC/course-material` (52); these are the ones that actually changed an idea's evidence, scope, or risk (new-course requests, internal refactors, and minor UI polish aren't listed):

| Repo | # | Title | Affects | Effect |
|---|---|---|---|---|
| gutenberg | [193](https://github.com/OxfordRSE/gutenberg/issues/193) | WCAG automation (DRIFT, high priority) | F1 #3 | Narrow #3 to content remediation, not platform automation |
| gutenberg | [408](https://github.com/OxfordRSE/gutenberg/issues/408), [424](https://github.com/OxfordRSE/gutenberg/issues/424) | a11y: keyboard-unusable popup / comment box | F1 #3 | Concrete, non-DRIFT bugs to cite as remediation scope |
| gutenberg | [478](https://github.com/OxfordRSE/gutenberg/issues/478) | "Prereqs" (DRIFT) | F3 #1 | DRIFT overlap — coordinate first |
| gutenberg | [484](https://github.com/OxfordRSE/gutenberg/issues/484) | "Outcomes to badges... once coverage is mature" (DRIFT) | F1 #8, F3 #6 | Confirms #8 as a real DRIFT blocker; #6 duplicates DRIFT's plan |
| gutenberg | [386](https://github.com/OxfordRSE/gutenberg/issues/386) | "Embedded surveys" (effort: high) | F3 #7 | Broader version of #65; maintainer's own effort label is a reality check |
| gutenberg | [165](https://github.com/OxfordRSE/gutenberg/issues/165), [191](https://github.com/OxfordRSE/gutenberg/issues/191) | Search conciseness / broken link | F1 #6 | Corrects "no search exists" — it already does |
| gutenberg | [188](https://github.com/OxfordRSE/gutenberg/issues/188), [189](https://github.com/OxfordRSE/gutenberg/issues/189), [434](https://github.com/OxfordRSE/gutenberg/issues/434) | Test template/repo; course-developer docs | F1 #5 | Independent confirmation of the exact gap #5 addresses |
| course-material | [162](https://github.com/UNIVERSE-HPC/course-material/issues/162), [81](https://github.com/UNIVERSE-HPC/course-material/issues/81), [170](https://github.com/UNIVERSE-HPC/course-material/issues/170)/[171](https://github.com/UNIVERSE-HPC/course-material/pull/171) | Missing learning outcomes (OOP C++, functional programming; Python fixed) | F1 #8 | The `learningOutcomes` field already exists (~62% adopted) — corrects an earlier draft of this doc |
| course-material | [98](https://github.com/UNIVERSE-HPC/course-material/issues/98) | Attribution for ported lessons | F1 #4 | Upgrades #4 from inferred to confirmed |
| course-material | [238](https://github.com/UNIVERSE-HPC/course-material/issues/238) | Missing `dependsOn` on Cloud Computing | F1 #1/#9, F3 #1 | `dependsOn` coverage has known gaps |
| course-material | [252](https://github.com/UNIVERSE-HPC/course-material/issues/252) | Hardcoded oxrse.uk links | F1 #7 | Concrete case of the non-persistent-URL problem #7 fixes |
| course-material | [215](https://github.com/UNIVERSE-HPC/course-material/issues/215) | Simplistic end-episode MCQs | F3 #1 | Supports extending #1 into in-course knowledge checks |
| course-material | [115](https://github.com/UNIVERSE-HPC/course-material/issues/115) | Port foundational HPC course | F1 #9 | Real, stalled (2024) granularity-mismatch question |

### Self-scored evaluation against CHARTED's FAIR Training Evaluation Service

The evaluation's ~50 questions load one section at a time as a Google Form, but the full set is embedded in the page data regardless — read without submitting a response:

| Question | Answer | Evidence |
|---|---|---|
| Lists prerequisite training resources | **Yes** | `dependsOn` |
| Open format / clear licence / open licence / versioned repo | **Yes** (all four) | Markdown, CC-BY-4.0, GitHub |
| Metadata checked when updating | **Yes** | CI validates front matter |
| Machine-readable metadata describing the resource | **Partial/No** | Only consumed internally → **F1 #2** |
| Terminology from a controlled vocabulary | **No** | `tags` are free-text → **F1 #1** |
| Persistent identifier | **No** | Repo-local `id` only → **F1 #7** |
| Defined accessibility conventions | **Likely No** | No WCAG policy on record |
| Different accessibility levels considered | **Partial** | Ad hoc transcripts; two open WCAG bugs (#408, #424) |
| Collects learner feedback | **No** | [Issue #65](https://github.com/OxfordRSE/gutenberg/issues/65), open since 2023, has drafted survey content never built → **F3 #7** |

Genuinely not answerable from the repo: dedicated support channel, mailing list, advertising process, funding/sustainability description — operational facts, not code. Worth submitting the real form eventually for CHARTED's official report and to be on their radar, but the gaps above are already known either way.

---

## Fund 1: FAIRifying Training Resources

| # | Idea | Ties to the call | Effort | Evidence | Ours/wider |
|---|------|-------------------|--------|----------|------------|
| 1 | Skills-framework crosswalk metadata | "mapping skills from well established frameworks onto training resources" (verbatim) | M | ✓ confirmed gap | **Ours** |
| 2 | Structured catalogue export | "adopting common metadata schemas" (verbatim) | S–M | ✓ confirmed gap | Wider |
| 3 | Accessibility content remediation | "adapting resources for different delivery modes or audiences" (verbatim) | M | ✓ confirmed gap | **Ours** |
| 4 | Structured attribution/licensing metadata | FAIR reusable/interoperable pillars | S | ✓ confirmed gap (#98) | **Ours** |
| 5 | Multi-institution schema adoption guidance | "documentation and contribution processes"/"guidance for trainers" (verbatim) | M | ✓ confirmed gap (#188, #189, #434) | Wider |
| 6 | Findability/search improvements | FAIR findable pillar | M | inferred (search already exists — #165, #191) | **Ours** |
| 7 | Persistent identifiers for courses | FAIR findable pillar | S–M | ✓ confirmed gap (#252) | **Ours** (fixes our broken links) |
| 8 | Complete learning-outcome coverage and enforce it | "prerequisites and learning outcomes" (verbatim) | S | ✓ confirmed gap (#162, #81; blocks DRIFT #484) | **Ours** |
| 9 | Modularizing training | "modularizing training" (verbatim, also in Fund 3) | M | ✓ confirmed gap — actively underway (#115, #132–141, #208, #269) | **Ours** |

1. **Skills-framework crosswalk metadata — primarily for us.** Add a `competencies:` field mapping each course onto **SFIA** (Skills Framework for the Information Age), replacing free-text `tags`. Decided over Vitae's Researcher Development Framework deliberately, not left open: Vitae RDF's domains (e.g. "Personal Effectiveness," "Engagement, Influence and Impact") are built for broad researcher professional development, not technical content — mapping a software-engineering/HPC catalogue onto it would produce a coarse, mostly-unhelpful crosswalk where most courses land on the same one or two domains. SFIA's granular, leveled skill codes (`PROG`, `TEST`, etc.) map naturally onto specific technical course content instead, and it's already the de facto professional-skills reference for the RSE/RTP community CHARTED itself serves. The point of the crosswalk is internal: give our own learners a clear "this course teaches you X" and give maintainers a real gap-analysis tool (which competencies have zero matching courses) for planning the catalogue — external discoverability via an SFIA lens is a nice-to-have, not the pitch. Build: schema + linter update, a tagging pass across 46 courses (ideally with original authors, and after idea #8's outcomes exist to tag against), and an internal crosswalk view. Foundational for Fund 3 idea #3. Note `dependsOn` itself has known gaps (#238) — the metadata this sits on isn't 100% complete either. **£7.5k–10k.**

2. **Structured catalogue export — mostly benefits other providers, lower priority here.** Generate a feed conforming to the RDA minimum metadata schema's actual 14 fields (Title, Description, Author(s), Language, Keywords, License, Version Date, URL to Resource, Resource URL Type, Target Group, Learning Resource Type, Learning Outcome(s), Access Cost, Expertise Level) so external indexes (Carpentries Incubator, The Turing Way) can harvest the catalogue without scraping HTML. Most fields map onto data this repo already has or will have: `name`→Title, `summary`→Description, `attribution`→Author(s)/License, `tags`→Keywords, and — once idea #8 and #7 ship — `learningOutcomes`→Learning Outcome(s) and the persistent identifier→URL to Resource/Resource URL Type directly. Genuinely under-specified fields would be Target Group, Learning Resource Type, Access Cost (trivially "no" — everything's free), and Expertise Level, none of which this repo captures today. Well-evidenced against the call, but the direct payoff to our own platform or curriculum is thin — it mainly helps outsiders find us. Keep on the list for its low cost, not because it's a priority. **£2.5k–5k.**

3. **Accessibility content remediation.** Alt text and transcript remediation, a lint rule requiring transcripts on embedded video, and fixes for two filed UI bugs (#408, #424) — directly improves the experience for our own learners. **DRIFT overlap:** issue #193 (high priority) already claims platform-wide WCAG automation — this project is scoped to content and specific bugs only; check with DRIFT before finalising. The self-scored evaluation above already did the gap analysis, so this is remediation, not another audit. **£7.5k–12.5k.**

4. **Structured attribution/licensing metadata.** Split `attribution.citation` into structured fields (source, authors, URL, adapted-from) instead of free prose, plus a backfill and an SPDX licence check — internal data hygiene on our own catalogue. Confirmed by issue #98 ("Attribution for ported lessons"), not inferred. Smallest, lowest-risk idea here — a refactor of data that's already 80% there. **£1.5k–3k.**

5. **Multi-institution schema adoption guidance — explicitly about other institutions, lower priority here.** Package the existing schema/validator/linter as a guide + template repo so a *second* institution could adopt it. This is squarely "helps wider stuff" — the direct benefit to our own platform or material is minimal, it mainly grows adoption elsewhere. Real open-issue demand exists (#188/#189/#434), and it's a decent call-fit, but given the ecosystem-first steer above it's the weakest fit for our own priorities in this fund. **£5k–7.5k + unquantified partner time.**

6. **Findability/search improvements.** *Correction: search already exists* (issues #165, #191 are open bugs against it) — this extends it with the controlled-vocabulary/outcome metadata from ideas #1/#8, fixing #165/#191 along the way, rather than building search from scratch. Entirely about our own learners finding our own content faster. **£5k–7.5k.**

7. **Persistent identifiers for courses.** Give every course a real persistent identifier (DOI via Zenodo/GitHub-release integration) instead of the repo-local `id` slug. CHARTED's evaluation tool asks this as a literal yes/no criterion — currently no — and the practical cost already shows up as issue #252 (hardcoded, non-portable links). This directly implements two named fields in the RDA minimum metadata schema CHARTED itself specifies — "URL to Resource" and "Resource URL Type" — which explicitly expect a persistent-identifier-typed value (e.g. `DOI`), not a plain link. Zenodo-via-GitHub is the cheap route; skip building a bespoke registry. **£2.5k–5k.**

8. **Complete learning-outcome coverage and enforce it.** *Correction: this field already exists*, contrary to an earlier draft of this doc — `learningOutcomes:` is populated in ~68% of sections and ~35% of course summaries, and is rendered in the app. The gap is enforcement: no lint rule prevents regression, and #162/#81 are open concrete instances (#170 was fixed by PR #171, showing the pattern works). `learningOutcomes` isn't just our own schema's invention — it corresponds directly to "Learning Outcome(s)" in CHARTED's own cited RDA minimum metadata schema, defined there almost identically ("descriptions of what knowledge, skills or abilities students should acquire on completion of the resource"). Build: a linter rule, backfill for #162/#81, rollups to the 30 course summaries still missing it. This also unblocks DRIFT's own #484 ("Outcomes to badges"), explicitly gated on outcome coverage being "mature" — raising this idea's importance considerably while its cost is the cheapest on the page, since most of the writing is already done. **£2.5k–3.75k.**

9. **Modularizing training.** Audit the 46 courses against a stated modularity guideline — are sections too coarse-grained to reuse independently? — and split any that fail it, named verbatim as an eligible activity in *both* calls. Not hypothetical: `git log` shows `supercomputing` rewritten within the last day, sitting inside an already-open `[revamp]` epic (#132–141) plus #208/#269, and issue #115 hit this exact granularity problem in 2024 without ever getting an answer. This project answers that stalled question — coordinate with (don't duplicate) the ongoing revamp work. **£5k–10k.**

---

## Fund 3: Tools and Frameworks

| # | Idea | Scope | Ties to the call | Effort | DRIFT overlap? | Ours/wider |
|---|------|-------|-------------------|--------|-----------------|------------|
| 1 | Self-assessment / knowledge-verification quiz | small | "knowledge verification... confirming prerequisite mastery" (verbatim) | S–M | Yes — #478, coordinate first | **Ours** |
| 3 | Skills-gap self-assessment (framework-linked) | small–medium | "frameworks connecting skills to training resources" | M | No (depends on F1 #1) | **Ours** |
| 6 | Progress-tracking → open badges/credentials | medium–large | reusable/interoperable skill records | M–L | **Yes — #484, do not submit standalone** | Mixed |
| 7 | Learner feedback / suitability tool | small | "suitability for specific cohorts"/"learner rating systems" (verbatim); closes [#65](https://github.com/OxfordRSE/gutenberg/issues/65) | S–M | No | **Ours** |
| 8 | Personalised recommender from existing progress data | medium–large | "collaborative filtering or learner behavior analysis" (verbatim) | M–L | No | **Ours** |

*Ideas #2, #4, and #5 are out of consideration — see "Set aside" below. Numbering is kept as originally assigned rather than renumbered, so it stays consistent with the rest of this doc and with anything already discussed against it.*

**#1 — Self-assessment / knowledge-verification quiz.** A short quiz routing learners onto the existing `dependsOn` graph — matches the call's "knowledge verification" example almost word for word. **DRIFT overlap:** issue #478 ("Prereqs") already describes the entry-routing half — coordinate with DRIFT first, or frame the application as closing #478 explicitly. Issue #215 (simplistic end-of-episode MCQs) suggests a natural, separable extension into in-course checks. Lowest-risk Fund 3 idea otherwise — reuses data and navigation logic already in production. **£5k–7.5k.**

**#3 — Skills-gap self-assessment (framework-linked). Deferred, not chosen for this round.** Learners self-report against whichever framework Fund 1 idea #1 introduces; a maintainer-facing view also surfaces curriculum gaps (competencies with zero matching courses). Genuinely good idea, but a hard dependency on Fund 1 idea #1 landing first — and Fund 1 isn't guaranteed to be awarded, or to ship #1 on a timeline Fund 3's own 12 months could rely on. Making one grant's deliverable contingent on a second, separately-reviewed grant's outcome is exactly the kind of risk worth avoiding rather than building an application around. Revisit if Fund 1 #1 is actually funded and delivered. **£7.5k–10k.**

**#6 — Progress-tracking → open badges/credentials.** *Not recommended standalone.* Issue #484, tagged DRIFT, already states this exact plan ("map outcomes to badges once course coverage is mature") — proposing it independently risks reading as duplicate funding. The genuinely additive move is Fund 1 idea #8, the actual precondition #484 is waiting on. **£10k–15k, but see above.**

**#7 — Learner feedback / suitability tool.** This is issue #65 ("survey forms for event + eventGroup"), open since 2023, with real survey content already drafted by Southampton and simply never built — start with the eventGroup tier it flags as lowest-hanging fruit, then a course-level rating layer. A broader issue (#386, "Embedded surveys") generalises the same want but carries a maintainer `effort: high` label, worth weighing before committing to a light estimate. The single lowest-risk pitch in this whole document — no idea-generation risk, only build risk. **£7.5k–12.5k.**

**#8 — Personalised recommender from existing progress data.** A "what to learn next" recommender built entirely on progress data Gutenberg already records — named directly in the call, including its explicit welcome of AI-driven approaches — and needs no external partner. Scope the simple, `dependsOn`-aware rule-based version as the committed deliverable; a genuine collaborative-filtering model is a stretch goal gated on whether usage volume actually supports it. Strongest large-tier Fund 3 candidate for exactly this reason. **£7.5k–12.5k rule-based; more for real ML.**

**Set aside, out of consideration** (kept for reference only):
- **#2 — Role-based landing pages / cohort identification.** Curated persona landing pages via existing `tags`/`dependsOn`. Matched the call's cohort/self-identification examples, but overlaps #1/#3 closely enough not to be worth pursuing separately.
- **#4 — Standalone embeddable "skills navigator."** Generalising Gutenberg's navigation into an embeddable component for *other* providers' catalogues. Set aside per the ecosystem-first steer — built for institutions outside UNIVERSE-HPC, not us, and needs an external pilot partner besides.
- **#5 — Cross-provider recommender.** Same reasoning as #4 — only pays off once other institutions' catalogue data is involved; nothing in it improves our own catalogue on its own.

---

## Decided scope

**Fund 1: #1 (skills-framework crosswalk) + #7 (persistent identifiers) + #8 (learning-outcome coverage).** Sequence #8 before #1 — real outcome statements are what the crosswalk should be grounded in, not the other way round — then #7 independently, since it doesn't touch the other two. Combined cost **~£12.5k–18.75k**, comfortably under the £40k cap, with room for #4 (attribution, ~£1.5k–3k) as a cheap fourth item later if there's appetite, though it isn't part of the current plan.

**Fund 3: #7 (learner feedback tool) only.** #3 (skills-gap self-assessment) was the natural pairing with Fund 1 #1 and is genuinely a good idea, but it has a hard dependency on that crosswalk metadata existing, and Fund 1 isn't guaranteed to be awarded or to ship #1 on a timeline Fund 3's own 12 months could rely on — a cross-grant dependency is exactly the kind of risk worth avoiding rather than building an application around (see #3's own entry above, now marked deferred). #7 stands entirely on its own: real survey content already drafted by a partner institution, only the mechanism missing — no idea-generation risk, only build risk.

- **If Fund 1 succeeds and #1 actually ships**, #3 becomes worth revisiting as a future-round Fund 3 application, since the dependency it's currently blocked on would then be resolved.
- **#9 (modularizing training)** remains the strongest candidate for a third application later — the only idea named verbatim in both calls, and real, currently-unfunded work already happening on the catalogue.
- **#6 (badges) stays ruled out** — DRIFT's own issue #484 already claims that plan; Fund 1 #8 is the genuinely additive move there instead.
- **Fund 1 #2 and #5, Fund 3 #2/#4/#5** remain out of scope per the ecosystem-first steer — see their entries above.

---

## Priority ratings

**Importance** = value to *our own* ecosystem (Gutenberg + HPCu), per the ecosystem-first steer above — this is why ideas whose payoff is mainly external now score noticeably lower here than their call-fit alone would suggest. **Call fit** = how well-evidenced the match to the call text is, independent of who benefits. **Cost** converts each idea's estimate at **£10–12k/FTE-month** (≈£500–600/day), staff time only, excluding any partner institution's own costs; "open-ended" figures are a floor.

### Fund 1 (cap: £40k/project)

| # | Idea | Importance | Call fit | Cost |
|---|------|:--:|:--:|---|
| 1 | Skills-framework crosswalk | 9 | 9 | £7.5k–10k |
| 2 | Catalogue export | 4 | 9 | £2.5k–5k |
| 3 | Accessibility remediation | 9 | 8 | £7.5k–12.5k |
| 4 | Attribution metadata | 5 | 5 | £1.5k–3k |
| 5 | Adoption guidance | 3 | 8 | £5k–7.5k+ |
| 6 | Search improvements | 6 | 5 | £5k–7.5k |
| 7 | Persistent identifiers | 7 | 9 | £2.5k–5k |
| 8 | Learning-outcome coverage | 9 | 9 | £2.5k–3.75k |
| 9 | Modularizing training | 8 | 10 | £5k–10k |

Idea #2 and #5 dropped sharply on importance (7→4, 7→3) purely because their payoff is mostly external — good call-fit, weak fit for the stated priority of improving our own ecosystem first.

### Fund 3

| # | Idea | Scope | Importance | Call fit | DRIFT? | Cost |
|---|------|-------|:--:|:--:|:--:|---|
| 1 | Knowledge-verification quiz | small | 8 | 9 | Yes (#478) | £5k–7.5k |
| 3 | Skills-gap self-assessment | small–medium | 8 | 8 | No | £7.5k–10k |
| 6 | Badges/credentials | medium–large | 4 | 3 | **Yes (#484) — not standalone** | £10k–15k |
| 7 | Learner feedback tool | small | 7 | 9 | No | £7.5k–12.5k |
| 8 | Personalised recommender | medium–large | 8 | 9 | No | £7.5k–12.5k+ |

*#2, #4, and #5 are out of consideration (see the "Set aside" list above) and dropped from this table rather than scored — #4/#5 in particular were the two lowest-importance ideas in the whole doc (3/10 each) precisely because their entire value proposition was serving other providers, which is exactly why they're no longer being pursued.*

**Cap check:** Fund 3's small tier is £15k. #6 sits right at that ceiling even before its DRIFT problem; #3+#7 bundled would also brush against it, which is now moot since #3 isn't being submitted this round anyway — cost #7 precisely on its own before submitting.

**Reading it together:** Fund 1 #1/#3/#8/#9 and Fund 3 #1/#3/#7/#8 are the ideas that score well on importance *and* have reasonable call fit — every one of them is squarely "our stuff," and Fund 3 is now clean of anything primarily external-facing. Fund 1 #2/#5 are the remaining cases of good call-fit undercut by being mostly for the wider community — kept in the main Fund 1 list since their cost is low, but deprioritised. Of the Fund 3 cluster, only **#7 is actually going in this round** — see "Decided scope" above; #3 scores just as well but is deferred over the cross-grant dependency risk, not because its scores dropped. Fund 3 #6 stays ruled out — DRIFT already claims it.

---

*Living brainstorm doc — not a submitted proposal. Effort: S = days, M = 1–4 weeks, L = 4+ weeks / needs external partners.*
