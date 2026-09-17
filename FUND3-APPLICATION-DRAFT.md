# CHARTED Fund 3 application draft — idea #7 (learner feedback / suitability tool)

Drafted against the actual Good Grants form structure (Sections A–G). Fields you need to fill in yourself are marked [YOU]; everything else is a ready-to-paste draft.

Framing note: this is deliberately written as a community-benefit pitch throughout — no reference to Gutenberg or UNIVERSE-HPC lacking anything, no "this closes our gap" language. The same underlying facts (issue #65, the Southampton survey content) are recast as *why the community-level opportunity is credible and low-risk* — proven content, a live pilot platform, a real methodology to share — never as an admission of a shortfall on our end. Internally we're doing this because it benefits our own ecosystem; the application itself should read as if community impact were the whole motivation.

---

## Section A: Start

Category: CHARTED Fund 3

Application name: A Reusable Toolkit for Learner Feedback and Training-Resource Suitability

---

## Section B: Applicant Information

B1 — Job Title Senior Research Software Engineer

B2 — Institution
Oxford Research Software Engineering Group (OxRSE), University of Oxford.

B3 — Collaborators/Partners (optional) [YOU — decide first]
The survey content this toolkit builds on was originally developed by Steve Crouch (University of Southampton, UNIVERSE-HPC) from the Southampton training pilots. You can cite that as the methodology's provenance without naming him as a collaborator, or loop him in and name him here — only if actually confirmed with him, since reviewers may expect evidence of real engagement (a letter of support, at minimum) for anyone named.

B4 — Collaborator/Partner Details (optional)
Leave blank if B3 is blank.

---

## Section C: Project Details

C1 — Project Title
A Reusable Toolkit for Learner Feedback and Training-Resource Suitability

C2 — Description (~500 words: Motivation / Scope / Objectives / Expected Outcomes)

Motivation. Trainers need evidence about whether their resources suit the learners who use them, but feedback is often collected inconsistently and is difficult to compare across events or platforms. A survey methodology for event feedback and training-resource suitability has already been developed and tested through UNIVERSE-HPC training delivery, including the Southampton pilots. However, the question sets and lessons from that work have not yet been packaged as an open, reusable tool that other trainers and platforms can adopt. This project will turn that existing methodology into practical, shareable infrastructure.

Scope. The project will deliver two connected components as open, documented and reusable pieces rather than one-off scripts: (1) an event-level feedback mechanism comprising a schema, form and storage model, based on the Southampton question set; and (2) a per-course suitability-rating feature allowing learners to indicate whether a resource suited their level or background, with a trainer-facing aggregation view. The components will be implemented and piloted on the open-source Gutenberg training platform. Gutenberg is a suitable reference deployment because it serves a substantial training catalogue and is designed to host material from institutions beyond the current contributors. The underlying schemas, question bank and interface contracts will be documented so that the approach can be adapted to other platforms.

Objectives.

1. Package the existing event-feedback and suitability-rating methodology as an open, documented toolkit that is not tied to a single platform’s internals.
2. Implement and evaluate the toolkit in a live pilot on Gutenberg, producing evidence about its usability and usefulness for learners and trainers.
3. Publish the toolkit, question bank, implementation guidance and evaluation findings to the CHARTED HUB, so that dRTP trainers and platform maintainers can adapt the approach without repeating the survey-design work.

Expected outcomes. An open-source toolkit that helps trainers collect comparable evidence about event delivery and resource suitability; a working reference deployment on Gutenberg; and open documentation, a question bank and evaluation findings that lower the barrier for other dRTP providers to adopt or adapt the approach.

C3 — Start Date
[YOU] — suggested wording: "Within three months of an award decision following the 30 September 2026 deadline; anticipated start [Month Year]."

C4 — Context (~500 words: alignment with CHARTED's goals, fit with the wider dRTP ecosystem)

This project directly addresses two of Fund 3’s named example activities: tools for evaluating training-resource suitability for specific cohorts or learner types, and learner rating systems for training-content evaluation. It also supports CHARTED’s wider goal of making the dRTP training ecosystem easier to navigate. Suitability information gives learners a quality and relevance signal, while structured feedback gives trainers evidence they can use to improve resources and understand which audiences they serve well.

The project builds on question sets developed and used during real UNIVERSE-HPC training delivery, including the Southampton pilots. This provides a credible starting point while leaving a clear role for evaluation: the project will test how well the methodology translates into reusable software, how easily learners can provide useful feedback, and what information trainers can act on. Gutenberg is an appropriate reference deployment because it is open source, supports both scheduled events and self-paced courses, and is designed to host material from institutions beyond the current contributors. Its existing catalogue and learner base provide a realistic setting in which to test the tool, while the open implementation and documentation will support reuse elsewhere.

The project has also been checked against the sibling DRIFT initiative’s roadmap, given the overlap in programme partners. No identified DRIFT activity covers this combination of event feedback, resource-suitability ratings and an open implementation, so the proposed work is complementary rather than duplicative.

---

## Section D: Costs & Plans

D1 — Total Amount Requested
[YOU — insert final figure], based on approximately 0.8 FTE-months of staff effort at the Oxford-approved Full Economic Cost rate. The requested amount should represent 80% of the project’s Full Economic Cost, in line with the fund’s funding policy.

D2 — Project Outline (attachment — milestones / budget / resourcing / risk analysis)

Milestones
1. Month 1 — Event feedback: finalise the reusable schema, adapt the piloted question set and implement the form and storage model.
2. Month 2 — Pilot deployment: deploy the event-feedback component on Gutenberg and evaluate it against a live training event.
3. Month 3 — Suitability and reuse: implement the course-suitability feature and trainer aggregation view; publish the toolkit, question bank, evaluation findings and CHARTED HUB methodology write-up.

Budget: Approximately 0.8 FTE-months in total, costed at the Oxford-approved Full Economic Cost rate of [£X per FTE-month], giving a total project cost of [£Y] and a requested CHARTED contribution of [£Z] at 80% FEC.

Resourcing: The project will be delivered by the applicant, a Senior Research Software Engineer in the Oxford Research Software Engineering Group, using the existing Gutenberg platform and UNIVERSE-HPC training materials. No equipment costs are requested. The pilot will use an available live training event, with feedback from learners and trainers informing the evaluation and documentation.

Risk analysis
- *Adoption and response-volume risk:* feedback tools are only useful if learners and trainers can use them with low friction. This will be mitigated by testing the event component during a scheduled training event and using the pilot to refine the interaction and question presentation.
- *Evaluation risk:* a small pilot may not generate enough responses to support broad conclusions. The project will therefore evaluate usability and implementation as well as response data, and will document the limitations and conditions needed for a larger follow-up.
- *Scope risk:* a broader vision of surveys embeddable in any context would be substantially harder to build and evaluate. The project is tightly scoped to the two defined components, with broader survey infrastructure treated as future work.

D3 — Costing Breakdown (attachment)

Event-feedback mechanism (schema, storage and form): 0.5 FTE-months

Course-suitability feature and trainer aggregation view: 0.2 FTE-months

Documentation, evaluation findings, question-bank publication and CHARTED HUB write-up: 0.1 FTE-months

Total staff effort: 0.8 FTE-months

Total cost: £________________

80% FEC coverage under UKRI policy — confirm with your institution's grants office how the remaining 20% is accounted for before finalising.

---

## Section E: Supporting Information

E1 — Project Benefits (~500 words: expected benefits/impact, including support for the dRTP community)

The immediate benefit will be to learners and trainers using the Gutenberg pilot. Learners will have a straightforward way to report whether a resource suited their level, background and goals. Trainers will receive structured feedback about event delivery and resource suitability, giving them evidence to use when revising material and deciding which audiences a resource serves well. The event feedback and course-suitability data will be kept as separate but related uses of the same underlying approach, so the project can test both without conflating them.

The wider community benefit will come from the concrete outputs: an open question bank, documented schemas for collecting feedback, an implementation on Gutenberg, and findings about what worked in the pilot. These will be most directly useful to training providers and repositories that want to collect structured feedback but do not yet have a defined question set or an implementation pattern. Other platforms will be able to use the question bank and adapt the documented data model and methods to their own systems.

The project will contribute a description, progress or methods post, and final outputs to the CHARTED HUB, with open repositories linked where appropriate. The pilot findings will also make clear the limitations of the approach and what further work would be needed before wider adoption, supporting CHARTED's goal of a more navigable and evidence-informed dRTP training ecosystem.

E2 — Additional Information (optional)
[YOU]

---

## Section F: Terms & Conditions

F1 — Confirm: employed by a UK university (University of Oxford). ✅
F2 — Confirm: commit to engaging with your local community to disseminate outcomes. ✅
F3 — Confirm: commit to disseminating on the dRTP skills HUB and sharing outputs. ✅ (built into C2/E1 above)
F5 — Where did you hear about this fund? [YOU]

---

## Section G: Demographic Details

Optional, personal, not used in review — [YOU] entirely.

---

*Draft to work from, not a final submission — re-verify factual claims against current repo state before submitting, since both repos are under active development.*
