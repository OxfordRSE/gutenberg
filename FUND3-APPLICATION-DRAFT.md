# CHARTED Fund 3 application draft — idea #7 (learner feedback / suitability tool)

Drafted against the actual Good Grants form structure (Sections A–G). Fields you need to fill in yourself are marked **[YOU]**; everything else is a ready-to-paste draft.

**Framing note:** this is deliberately written as a community-benefit pitch throughout — no reference to Gutenberg or UNIVERSE-HPC lacking anything, no "this closes our gap" language. The same underlying facts (issue #65, the Southampton survey content) are recast as *why the community-level opportunity is credible and low-risk* — proven content, a live pilot platform, a real methodology to share — never as an admission of a shortfall on our end. Internally we're doing this because it benefits our own ecosystem; the application itself should read as if community impact were the whole motivation.

---

## Section A: Start

**Category:** CHARTED Fund 3

**Application name:** A Reusable Learner Feedback & Training-Suitability Toolkit for dRTP Trainers

---

## Section B: Applicant Information

**B1 — Job Title** **[YOU]**

**B2 — Institution**
Oxford Research Software Engineering Group (OxRSE), University of Oxford.

**B3 — Collaborators/Partners** (optional) **[YOU — decide first]**
The survey content this toolkit builds on was originally developed by Steve Crouch (University of Southampton, UNIVERSE-HPC) from the Southampton training pilots. You can cite that as the methodology's provenance without naming him as a collaborator, or loop him in and name him here — **only if actually confirmed with him**, since reviewers may expect evidence of real engagement (a letter of support, at minimum) for anyone named.

**B4 — Collaborator/Partner Details** (optional)
Leave blank if B3 is blank.

---

## Section C: Project Details

**C1 — Project Title**
A Reusable Learner Feedback & Training-Suitability Toolkit for dRTP Trainers

**C2 — Description** (~500 words: Motivation / Scope / Objectives / Expected Outcomes)

> **Motivation.** Across the dRTP training landscape, trainers routinely have no systematic way to find out whether their material suited the learners it reached, or to gather structured feedback at all — most rely on ad hoc, informal impressions rather than evidence. A genuinely useful survey methodology for exactly this purpose already exists and has been piloted: question sets covering event feedback and training-resource suitability were developed and tested during real UNIVERSE-HPC training delivery (the Southampton pilots), but this proven content has never been packaged into an open, reusable tool that other trainers or training platforms could simply adopt. This project does that packaging, turning validated survey design into working, shareable infrastructure.
>
> **Scope.** Two components, both built as open, documented, reusable pieces rather than one-off scripts: (1) a generic event-level feedback mechanism — schema, form, and storage — using the piloted Southampton question set; (2) a per-course suitability/rating widget letting learners flag whether a given training resource suited their level or background, with a trainer-facing aggregation view. Both are implemented and piloted on the open-source Gutenberg training platform, chosen as the reference deployment because it already serves a real, active, multi-institution training catalogue (UNIVERSE-HPC, 209 sections across 46 courses) and is designed to host material from further institutions beyond it.
>
> **Objectives.**
> 1. Package the piloted event-feedback and suitability-rating methodology as an open, documented, adoptable toolkit — not tied to any single platform's internals.
> 2. Validate it in a live production pilot on Gutenberg, so other adopters see proven behaviour, not just a specification.
> 3. Publish the toolkit, the underlying question bank, and a methodology write-up to the CHARTED hub, so any dRTP trainer or platform maintainer can adopt the same evidence-based approach without redoing the survey-design work themselves.
>
> **Expected outcomes.** An open-source, documented feedback-and-suitability toolkit usable by any dRTP training provider; a working, in-production reference deployment demonstrating it at real scale; and a CHARTED hub methodology resource that meaningfully lowers the barrier for the wider community to start collecting the same kind of evidence about their own training.

**C3 — Start Date**
**[YOU]** — suggested wording: *"Within three months of an award decision following the 30 September 2026 deadline; anticipated start [Month Year]."*

**C4 — Context** (~500 words: alignment with CHARTED's goals, fit with the wider dRTP ecosystem)

> This project answers two of Fund 3's own named example activities directly: "instruments evaluating training resource suitability for specific cohorts or learner types" and "learner rating systems for training content evaluation." More broadly, it speaks to CHARTED's core goal of improving the navigability and quality signals across the whole dRTP training landscape — most trainers currently have no structured way to know whether their material is working for the cohorts it reaches, and this toolkit gives them one, ready to adopt rather than built from scratch.
>
> The methodology itself already carries real community pedigree rather than being an untested design: the underlying survey questions were developed collaboratively across UNIVERSE-HPC partner institutions and refined through real training delivery (the Southampton pilots), so this project is about making already-validated work reusable, not experimenting with something unproven. Piloting the implementation on Gutenberg is a deliberate choice for the same reason — it's an open-source training platform that served over 25,000 unique visitors and 1,480 enrolled students across 62 training events in the past year alone, and is explicitly designed to host material from institutions beyond the ones currently using it, making it a credible testbed for a tool meant for community-wide reuse rather than a single closed platform.
>
> We checked this project against the sibling DRIFT initiative's own roadmap (same programme, overlapping partner institutions) to avoid duplicating committed work elsewhere in the ecosystem — no open DRIFT item covers this ground, so there's no overlap risk here.

---

## Section D: Costs & Plans

**D1 — Total Amount Requested**
**[YOU — pick a figure]**. Effort estimate: 2–3 weeks for the event-feedback component, +1–2 weeks for the course-suitability layer, at your actual day rate. A request in the **£7,500–£10,000** range is well justified and comfortably inside the £15,000 small-project cap.

**D2 — Project Outline** (attachment — milestones / budget / resourcing / risk analysis)

> **Milestones**
> 1. Month 1: Finalise the reusable event-feedback schema and adapt the piloted question set into it.
> 2. Month 2: Build and deploy the event-feedback form and storage on the Gutenberg pilot; validate against a live training event.
> 3. Month 3: Build the course-suitability widget and trainer aggregation view; publish the toolkit, question bank, and CHARTED hub methodology write-up.
>
> **Budget:** [YOU — staff days × your actual day rate]
>
> **Resourcing:** [YOU]
>
> **Risk analysis**
> - *Adoption/response-volume risk:* feedback tools are only as useful as the responses they collect — mitigated by validating against a real, already-scheduled training event with a known audience during the pilot phase, rather than waiting for organic uptake to prove the concept.
> - *Scope risk:* a broader "surveys embeddable in any context" vision exists as an idea in the wider community discussion and is known to be substantially harder to build well — mitigated by scoping this project tightly to the two proven, well-defined components above, with anything broader treated explicitly as future work.

**D3 — Costing Breakdown** (attachment)

> | Item | Days | Rate | Cost |
> |---|---|---|---|
> | Event-feedback mechanism (schema, storage, form) | ~10 | [your day rate] | [—] |
> | Course-suitability widget + aggregation view | ~5 | [your day rate] | [—] |
> | Documentation, question-bank publication, CHARTED hub write-up | ~2 | [your day rate] | [—] |
> | **Total** | ~17 days | | **[—]** |
>
> 80% FEC coverage under UKRI policy — confirm with your institution's grants office how the remaining 20% is accounted for before finalising.

---

## Section E: Supporting Information

**E1 — Project Benefits** (~500 words: expected benefits/impact, including support for the dRTP community)

> The primary benefit is to the wider dRTP community: this toolkit gives any trainer or platform maintainer a proven, ready-to-adopt way to gather learner feedback and assess training-resource suitability, without needing to design surveys or feedback infrastructure themselves. Because the underlying methodology was developed and tested through real training delivery across UNIVERSE-HPC partner institutions, adopters get community-validated content, not a first draft.
>
> The live pilot deployment matters for adoption in its own right: rather than publishing a specification, this project demonstrates the toolkit operating in production on a real, active, multi-course training catalogue — something other trainers and platform maintainers can point to and directly evaluate before committing their own time to adopting it. The open-sourced question bank is also a standalone community asset independent of the tool itself, usable by anyone running training feedback surveys regardless of what platform they use.
>
> Taken together, this project turns an existing but under-used piece of community knowledge — a validated feedback and suitability methodology — into genuinely reusable, documented infrastructure, directly advancing CHARTED's goal of a more navigable, evidence-informed dRTP training ecosystem.

**E2 — Additional Information** (optional)
**[YOU]**

---

## Section F: Terms & Conditions

**F1** — Confirm: employed by a UK university (University of Oxford). ✅
**F2** — Confirm: commit to engaging with your local community to disseminate outcomes. ✅
**F3** — Confirm: commit to disseminating on the dRTP skills HUB and sharing outputs. ✅ (built into C2/E1 above)
**F5 — Where did you hear about this fund?** **[YOU]**

---

## Section G: Demographic Details

Optional, personal, not used in review — **[YOU]** entirely.

---

*Draft to work from, not a final submission — re-verify factual claims against current repo state before submitting, since both repos are under active development.*
