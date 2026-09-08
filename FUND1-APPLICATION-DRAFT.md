# CHARTED Fund 1 application draft — ideas #8 + #1 + #7 (bundled)

Drafted against the Fund 1 Good Grants form (same structure as Fund 3: Sections A–G, but a single £40,000 cap rather than a small/large split, and slightly different worked examples in C2). Fields only you can fill in are marked **[YOU]**.

**Framing note — same rule as the Fund 3 draft:** community-benefit pitch throughout, no "our gaps" language. The three ideas (learning-outcome enforcement, skills-framework crosswalk, persistent identifiers) are bundled as one project because they're all genuinely FAIR-metadata gaps common across dRTP training providers, piloted and demonstrated on a real, substantial catalogue (209 sections across 46 courses, 9 categories) rather than a toy example.

---

## Section A: Start

**Category:** CHARTED Fund 1

**Application name:** Piloting Reusable FAIR Metadata Practices for dRTP Training Resources

---

## Section B: Applicant Information

**B1 — Job Title** **[YOU]**

**B2 — Institution**
Oxford Research Software Engineering Group (OxRSE), University of Oxford.

**B3 — Collaborators/Partners** (optional) **[YOU — decide]**
No specific external collaborator is required for this project — the work is schema, tooling, and content-pattern work on an existing open-source catalogue. Leave blank unless you want to loop in a UNIVERSE-HPC partner (e.g. for sign-off on the chosen skills framework, given the multi-institution authorship of the underlying material) — only name someone actually confirmed.

**B4 — Collaborator/Partner Roles and Expertise** (optional)
Leave blank if B3 is blank.

---

## Section C: Project Details

**C1 — Project Title**
Piloting Reusable FAIR Metadata Practices for dRTP Training Resources

**C2 — Description** (~500 words: Motivation / Scope / Objectives / Expected Outcomes)

> **Motivation:** Three FAIR-metadata practices are widely under-adopted across dRTP training resources: linking training content to recognised skills frameworks (so learners and employers can see what a course actually builds towards, and so the community can map skills to training as CHARTED itself aims to), consistently describing and enforcing learning outcomes rather than leaving them optional and inconsistently applied, and giving training resources genuine persistent identifiers rather than platform-local URLs that break when infrastructure changes. Rather than propose these abstractly, this project pilots and demonstrates all three on a real, substantial open training catalogue — 209 sections across 46 courses in 9 subject categories, served through the open-source Gutenberg training platform, which reached over 25,000 unique visitors and 1,480 enrolled students across 62 training events in the past year alone — producing both the improved metadata itself and a reusable, documented pattern other dRTP trainers and platforms can adopt directly.
>
> **Scope:** Three connected work packages: (1) complete and enforce learning-outcome descriptions across the catalogue, with a linter rule preventing future regressions, establishing a descriptive foundation for skills framework mapping; (2) map Gutenberg content onto **SFIA** (Skills Framework for the Information Age) — chosen over alternatives because its granular, leveled skill codes suit specific technical course content far better than broader researcher-development frameworks do — publishing both as embedded metadata in tagged content and an overall crosswalk showing how framework codes map to training resources; (3) mint persistent identifiers (DOIs via Zenodo) for the catalogue's training resources, replacing current local references with FAIR-compliant, citable identifiers.
>
> **Outputs:**
>
> 1. Ship a linter-enforced learning-outcomes standard, applied across the Gutenberg catalogue.
> 2. A published skills-framework crosswalk and its methodology, mapping existing and future training content onto a recognised framework.
> 3. Implement and document a lightweight, replicable persistent-identifier scheme for training courses.
> 4. Document all three as adoptable patterns, schema changes, tooling, and a written methodology, for any other dRTP trainer or platform maintainer.
>
> **Expected outcomes.** A FAIR improvement to our training catalogue via three distinct improvements to our metadata patterns (enforced learning outcomes, SFIA framework tagging and crosswalk, and persistent identifiers) published; and working, open-source tooling (schema validators, linter rules, identifier-minting configuration) other providers can adopt without redoing the design work.

**C3 — Start Date**
**[YOU]** — suggested wording: *"Within three months of an award decision following the 30 September 2026 deadline; anticipated start [Month Year]."*

**C4 — Context** (~500 words: alignment with CHARTED's goals, fit with the wider dRTP ecosystem)

> This project addresses three of Fund 1's eligible activities directly: "mapping skills from well established frameworks onto training resources," "improving training resource descriptions with prerequisites and learning outcomes," and the FAIR "findable" pillar's requirement for persistent identifiers. It also follows CHARTED's own guidance closely: two of the three work packages implement further fields from the RDA minimum metadata schema CHARTED itself: work package 1's complets our coverage of the schema's "Learning Outcome(s)" field, and work package 3's persistent identifiers implement its "URL to Resource"/"Resource URL Type" fields, which explicitly call for a persistent-identifier-typed value rather than a plain link. Work package 2's skills-framework crosswalk is a complementary but separate contribution, addressing CHARTED's broader landscape-mapping goal.
>
> None of these three practices are unique problems for Gutenberg, but rather common challenges across the dRTP community. Inconsistent learning-outcome coverage, an absence of skills-framework mapping, and a lack of persistent identifiers are common gaps across dRTP training resources generally, precisely because a framework hasn't yet been agreed and demonstrated. CHARTED's own materials note that "many national and international efforts" already exist around defining skills, roles, and training frameworks, and that the goal is to map our material onto these existing standards (Both via SFIA skills and RDA schema) rather than to come up with a new standdard, This project contributes one concrete, worked example of that mapping, that provides further encouragement for others to follow suit.
>
> This project also has a beneficial downstream effect elsewhere in the training-platform ecosystem: reliable learning-outcome coverage is a stated precondition for planned improvements to outcome-to-credential mapping on the open-source Gutenberg training platform, meaning this work directly unblocks further community-facing tooling beyond this project's own scope.

---

## Section D: Costs & Plans

**D1 — Total Amount Requested**
**[YOU — pick a figure]**. Combined effort estimate across the three work packages is roughly 6.5–8.75 weeks at your day rate (learning outcomes: 1–1.5 weeks; skills crosswalk: 3–4 weeks; persistent identifiers: 1–2 weeks). A request in the **£13,000–£18,000** range is well justified and leaves substantial headroom against the £40,000 cap.

**D2 — Project Outline** (attachment — milestones / budget / resourcing / risk analysis)

> **Milestones**
> 1. Month 1: Ship the learning-outcomes linter rule; complete outcome coverage across the catalogue.
> 2. Months 2–3: Build the SFIA schema/tooling; complete the tagging pass; publish the crosswalk.
> 3. Month 3 (can run in parallel with work package 2): Implement and run the persistent-identifier minting process across the catalogue.
> 4. Month 3: Publish methodology write-ups and open-source tooling for all three work packages to the CHARTED hub.
>
> **Budget:** [YOU — staff days × your actual day rate]
>
> **Resourcing:** [YOU]
>
> **Risk analysis**
> - *Tagging-accuracy risk:* mapping 46 courses onto SFIA accurately benefits from domain input — mitigated by a structured self-review pass against SFIA's own documentation, with the selection rationale and mapping methodology published so accuracy can be checked/improved by others.
> - *Identifier-scheme risk:* persistent-identifier granularity (per-course vs per-release) affects long-term usefulness — mitigated by choosing the well-established Zenodo/GitHub-release pattern rather than a bespoke registry, keeping the approach easy for others to replicate.

**D3 — Costing Breakdown** (attachment)

> | Item | Days | Rate | Cost |
> |---|---|---|---|
> | Learning-outcomes linter rule + coverage completion | ~7 | [your day rate] | [—] |
> | Skills-framework crosswalk (schema, tooling, tagging, publication) | ~17 | [your day rate] | [—] |
> | Persistent-identifier scheme (Zenodo/GitHub integration, minting, docs) | ~7 | [your day rate] | [—] |
> | Methodology write-ups / CHARTED hub publication | ~2 | [your day rate] | [—] |
> | **Total** | ~33 days | | **[—]** |
>
> 80% FEC coverage under UKRI policy; equipment costs excluded per the fund's terms (none required here). Confirm with your institution's grants office how the remaining 20% is accounted for before finalising.

---

## Section E: Supporting Information

**E1 — Project Benefits** (~500 words: expected benefits/impact, including support for the dRTP community)

> This project's benefits are primarily methodological and reusable, not confined to one catalogue. Skills-framework mapping is explicitly one of the landscape-mapping activities CHARTED wants to see more of — this project contributes a real, documented, at-scale example other trainers can learn from rather than a hypothetical proposal. Enforced learning-outcome coverage is a foundational FAIR practice that's easy to state and hard to sustain without tooling — the linter rule this project produces is directly adoptable by any other schema-driven training repository. Persistent identifiers are one of the most concretely testable FAIR criteria (CHARTED's own evaluation tool asks for them directly as a yes/no question), yet are rarely implemented in practice for training material specifically — this project's lightweight, Zenodo-based approach gives other trainers a low-effort template to follow.
>
> Beyond the three specific deliverables, publishing the methodology behind each — not just the resulting metadata — is the main community contribution: choosing and justifying a skills framework, designing an enforceable outcomes standard, and setting up low-friction persistent identifiers are all decisions every dRTP trainer eventually has to make, and this project gives them a worked, documented reference rather than requiring each provider to solve the same problems independently. All outputs — schema changes, linter rules, tooling, and the crosswalk itself — will be open source and published to the CHARTED hub alongside written methodology guides aimed specifically at reuse.

**E2 — Additional Information** (optional)
**[YOU]**

---

## Section F: Terms & Conditions

**F1** — Confirm: employed by a UK university (University of Oxford). ✅
**F2** — Confirm: commit to engaging with your local community to disseminate outcomes. ✅
**F3** — Confirm: commit to disseminating on the dRTP skills HUB and sharing outputs. ✅ (built into C2/E1 above)
**F4 — Where did you hear about this fund?** **[YOU]**

---

## Section G: Demographic Details

Optional, personal, not used in review — **[YOU]** entirely.

---

*Draft to work from, not a final submission. Sequencing note: do the learning-outcomes work (work package 1) before the skills-framework crosswalk (work package 2) — real outcome statements are what the crosswalk should be grounded in, not the reverse. Re-verify factual claims against current repo state before submitting.*
