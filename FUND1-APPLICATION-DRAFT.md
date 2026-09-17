# CHARTED Fund 1 application draft — ideas #8 + #1 + #7 (bundled)

Drafted against the Fund 1 Good Grants form (same structure as Fund 3: Sections A–G, but a single £40,000 cap rather than a small/large split, and slightly different worked examples in C2). Fields only you can fill in are marked **[YOU]**.

**Framing note — same rule as the Fund 3 draft:** community-benefit pitch throughout, no "our gaps" language. The three ideas (learning-outcome enforcement, skills-framework crosswalk, persistent identifiers) are bundled as one project because they're all genuinely FAIR-metadata gaps common across dRTP training providers, piloted and demonstrated on a real, substantial catalogue (209 sections across 46 courses, 9 categories) rather than a toy example.

TITLE:

FAIRifying Gutenberg Training Resources with Skills Mapping, Learning Outcomes and Persistent Identifiers

DESCRIPTION:

Motivation: dRTP training resources are difficult to discover, compare and reuse when their learning outcomes, skills relevance and identity are not described consistently. This project will address these issues through a focused FAIRification of the Gutenberg training catalogue, providing a substantial real-world testbed for developing and demonstrating reusable approaches. Gutenberg's training catalogue consists of over 200 sections and 46 courses across 9 themes. Oxford's deployment reached over 25,000 unique visitors and 1,500 enrolled students in the past year alone.

Scope: Three connected work packages: (1) complete and enforce learning-outcome descriptions across the catalogue, with a linter rule preventing future regressions, establishing a descriptive foundation for skills framework mapping; (2) map Gutenberg content onto SFIA (Skills Framework for the Information Age), publishing the mappings as embedded metadata in tagged content and creating a summary of this metadata showing how framework codes map to training resources; (3) mint persistent identifiers (DOIs via Zenodo) for the catalogue's training resources, replacing current local references with FAIR-compliant, citable identifiers. 

Outputs: 

1. A linter-enforced learning-outcomes standard, applied across the Gutenberg catalogue. 

2. A published skills-framework crosswalk and its methodology, mapping existing and future training content onto SFIA. 

3. An implemented lightweight, replicable persistent-identifier scheme for training courses, including versioning and release management. 

4. Documentation of the schemas, tooling, implementation methods and adoption guidance for all three outputs, suitable for use by other dRTP trainers and platform maintainers. 

Expected outcomes: 
 
The Gutenberg catalogue will become more findable, interpretable and reusable through consistent learning-outcome descriptions, skills-framework links and persistent identifiers. These improvements will be particularly valuable for independent learners using Gutenberg's self-paced Courses (https://train.rse.ox.ac.uk/courses), helping them find suitable material, judge whether it matches their goals and understand what they can expect to learn without relying on an instructor or scheduled training event. Other dRTP trainers and platform maintainers will have working, open-source examples and documented methods they can adapt without having to design the same metadata patterns and tooling from scratch. 

CONTEXT: 

This project addresses three of Fund 1's eligible activities directly: mapping skills from well-established frameworks onto training resources; improving training-resource descriptions, including learning outcomes; and improving findability through persistent identifiers. It also follows CHARTED's guidance on adopting common metadata schemas. Learning outcomes are currently present for approximately 60% of the catalogue's content files; this coverage will be reviewed, completed and supported by enforcement to prevent future omissions. The learning-outcomes work will complete the catalogue's coverage of the RDA minimum metadata schema's **Learning Outcome(s)** field, while the persistent-identifier work will implement its **URL to Resource** and **Resource URL Type** fields using stable, persistent-identifier-based links rather than platform-local URLs. The skills-framework crosswalk is a complementary contribution to CHARTED's broader goal of mapping skills, roles and training across the dRTP landscape. 

None of these three practices are unique problems for Gutenberg. Across the dRTP community, training resources are produced by different institutions and for different audiences, making it difficult for learners and trainers to compare content, identify relevant skills and reuse resources across platforms. CHARTED's guidance recognises that many national and international efforts already exist to define skills, roles and training frameworks. The aim is therefore to map training resources to established standards, rather than create another competing standard. This project will provide a practical example of that approach. SFIA is proposed for the pilot because its granular, levelled skill descriptions are well suited to the technical skills taught across the catalogue. The project will document both the rationale for this choice and the mapping method, allowing the wider community to assess whether SFIA is useful beyond the pilot or adapt the approach to another established framework where appropriate. 

The work will also support the learner-facing development of the open-source Gutenberg training platform, particularly its Courses 2.0 model of reusable, self-paced learning paths. Structured learning outcomes and skills metadata will help independent learners select courses that match their goals, starting point and available time, rather than relying on course titles or browsing individual sections. One of the catalogue's strengths is that relationships between resources are already clearly defined through `dependsOn` links, which show the prerequisite knowledge needed to move between them. Skills-framework mapping will build on this existing structure by adding a complementary view: prerequisites describe what a learner needs to know before beginning, while skills mapping describes the capabilities a resource helps them develop. Together, these relationships can support learners and trainers in combining courses or sections into deliberate training pathways, making it clearer how resources relate to one another and what learners can expect to gain from completing them. Reliable learning-outcome coverage is also a precondition for planned improvements to outcome-to-credential mapping, so this project will provide foundations for further community-facing tooling beyond the scope presented here. These platform benefits are useful in their own right, while the underlying metadata patterns and documentation will remain open and reusable by other dRTP trainers and platforms.  

PROJECT BREAKDOWN:

Milestones

1. Month 1: Learning outcomes: define the standard, implement the linter rule and complete the learning-outcome coverage review and update across the catalogue. Publish to Gutenberg. 

2. Months 2–3: Skills mapping: confirm the SFIA mapping method, implement the metadata and supporting tooling, complete the tagging pass and publish the crosswalk on Gutenberg. 

3. Month 3: Persistent identifiers: confirm the identifier and versioning scheme, integrate Zenodo with the release process, and apply the scheme to the catalogue’s training resources. 

4. Month 3: Reuse and dissemination: publish the schemas, tooling, crosswalk, identifier documentation and methodology to the CHARTED HUB, with adoption guidance for other trainers and platform maintainers. 

Budget: 0.3 * 3 months = 0.9 FTE? 

Resourcing: The project will be delivered by Alasdair Wilson, a Senior Research Software Engineer in the Oxford Research Software Engineering Group, using the existing Gutenberg and HPCu course-material repositories. No equipment costs are required. Community input will be sought where needed to review the skills-framework mapping. 

Risk analysis: 

- Tagging-accuracy risk: mapping the catalogue onto SFIA accurately benefits from domain input, mitigated by a structured review against SFIA’s documentation, recording the selection rationale and publishing the mapping methodology so that others can evaluate and improve it. 

- Identifier-scheme risk: identifier granularity and versioning (for example, per-course versus per-release) affect long-term usefulness, mitigated by adopting the established Zenodo/GitHub-release pattern rather than creating a bespoke registry. 

- Scope and delivery risk: completing the metadata review, tooling and documentation within three months could create pressure at the end of the project, mitigated by sequencing the learning-outcomes work first, running identifier work in parallel with skills mapping, and treating the documented, reusable implementation as the required final output rather than adding new platform features. 

Costing breakdown: 
 
Learning-outcomes standard, linter rule and coverage completion: 0.3 FTE-months 

SFIA mapping method, metadata, tooling, tagging and crosswalk: 0.7 FTE-months 

Persistent-identifier and versioning scheme, integration and application: 0.3 FTE-months 

Documentation, adoption guidance and CHARTED HUB publication: 0.1 FTE-months 

Total staff effort: 1.4 FTE-months 

Total cost: £???? 

 
---

## Section E: Supporting Information

**E1 — Project Benefits** (~500 words: expected benefits/impact, including support for the dRTP community)

The immediate benefit will be to learners and trainers using the Gutenberg catalogue. Completing and enforcing learning-outcome metadata will make it easier for independent learners to judge whether a resource is relevant to their aims and current knowledge. Linking resources to SFIA skills will add information about the capabilities they develop, while persistent identifiers will make the resources easier to cite, link to and refer to across releases. This also gives authors a more attributable and recognisable contribution: they can point to a stable, citable version of the training material and gather evidence of its reuse. Trainers will gain a clearer basis for reviewing the catalogue, identifying related material and maintaining the metadata as content changes.

The wider community benefit will come from the project's concrete, open outputs rather than from a claim that one implementation will suit every platform. The project will publish the learning-outcomes convention, the linter rule and tests, the SFIA mapping and selection method, and the identifier and versioning process. These will be directly useful to training repositories that use structured Markdown or similar metadata-driven workflows; other platforms can use the documented fields and methods as a reference when implementing equivalent features in their own systems. The worked example will also show the effort involved, the decisions made and the limitations encountered, giving other providers evidence with which to decide whether and how to adopt the approach.

The project will contribute a description, progress or methods post, and final outputs to the CHARTED HUB, with open repositories linked where appropriate.

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






actual version in word:

TITLE: 

FAIRifying Gutenberg Training Resources with Skills Mapping, Learning Outcomes and Persistent Identifiers 

DESCRIPTION: 

Motivation: dRTP training resources are difficult to discover, compare and reuse when their learning outcomes, skills relevance and identity are not described consistently. This project will address these issues through a focused FAIRification of the Gutenberg training catalogue, providing a substantial real-world testbed for developing and demonstrating reusable approaches. Gutenberg's training catalogue consists of over 200 sections and 46 courses across 9 themes. Oxford's deployment reached over 25,000 unique visitors and 1,500 enrolled students in the past year alone. 

Scope: Three connected work packages: (1) complete and enforce learning-outcome descriptions across the catalogue, with a linter rule preventing future regressions, establishing a descriptive foundation for skills framework mapping; (2) map Gutenberg content onto SFIA (Skills Framework for the Information Age), publishing the mappings as embedded metadata in tagged content and creating a plain-language summary showing which SFIA skills are linked to which training resources; (3) create and assign persistent identifiers (DOIs via Zenodo) for the catalogue's training resources, replacing current local references with FAIR-compliant, citable identifiers. 

Outputs: 

1. A linter-enforced learning-outcomes standard, published as front-matter yaml syntax and applied across the Gutenberg catalogue. 

2. A published skills-framework crosswalk and its methodology, mapping existing and future training content onto SFIA. 

3. An implemented lightweight, replicable persistent-identifier scheme for training courses, including versioning and release management managed via github release tagging and associated triggered actions. 

4. Documentation of the schemas, tooling, implementation methods and adoption guidance for all three outputs, suitable for use by other dRTP trainers and platform maintainers. Published to the Gutenberg documentation site and the CHARTED hub. 

Expected outcomes: 
 
The Gutenberg catalogue will become more findable, interpretable and reusable through consistent learning-outcome descriptions, skills-framework links and persistent identifiers. These improvements will be particularly valuable for independent learners using Gutenberg's self-paced Courses, which are self-paced structured learning pathways provided to all users (https://train.rse.ox.ac.uk/courses), helping them find suitable material, judge whether it matches their goals and understand what they can expect to learn without relying on an instructor or scheduled training event. Other dRTP trainers and platform maintainers will have working, open-source examples and documented methods they can adapt without having to design the same metadata patterns and tooling from scratch. 

CONTEXT: 

This project addresses three of Fund 1's eligible activities directly: mapping skills from well-established frameworks onto training resources; improving training-resource descriptions, including learning outcomes; and improving findability through persistent identifiers. It also follows CHARTED's guidance on adopting common metadata schemas. Learning outcomes are currently present for approximately 60% of the catalogue's content files; this coverage will be reviewed, completed and supported by enforcement to prevent future omissions. The learning-outcomes work will complete the catalogue's coverage of the Research Data Alliance (RDA) minimum metadata schema's **Learning Outcome(s)** field, while the persistent-identifier work will implement its **URL to Resource** and **Resource URL Type** fields using stable, persistent-identifier-based links rather than platform-local URLs. The skills-framework crosswalk is a complementary contribution to CHARTED's broader goal of mapping skills, roles and training across the dRTP landscape. 

None of the three proposed work-packages solve problems unique to Gutenberg. Across the dRTP community, training resources are produced by different institutions and for different audiences, making it difficult for learners and trainers to compare content, identify relevant skills and reuse resources across platforms. CHARTED's guidance recognises that many national and international efforts already exist to define skills, roles and training frameworks. The aim is therefore to map training resources to established standards, rather than create another competing standard. This project will provide a practical example of that approach. SFIA is proposed for the pilot because its granular, levelled skill descriptions are well suited to the technical skills taught across the catalogue. The project will document both the rationale for this choice and the mapping method, allowing the wider community to assess whether SFIA is useful beyond the pilot or adapt the approach to another established framework where appropriate. 

The work will also support the learner-facing development of the open-source Gutenberg training platform, particularly its Courses which consist of reusable, self-paced learning paths. Structured learning outcomes and skills metadata will help independent learners select courses that match their goals, starting point and available time, rather than relying on course titles or browsing individual sections. One of the catalogue's strengths is that relationships between resources are already clearly defined through `dependsOn` links, which show the prerequisite knowledge needed to move between them. Skills-framework mapping will build on this existing structure by adding a complementary view: prerequisites describe what a learner needs to know before beginning, while skills mapping describes the capabilities a resource helps them develop. Together, these relationships can support learners and trainers in combining courses or sections into deliberate training pathways, making it clearer how resources relate to one another and what learners can expect to gain from completing them. Reliable learning-outcome coverage is also a precondition for planned improvements to outcome-to-credential mapping, so this project will provide foundations for further community-facing tooling beyond the scope presented here. 

PROJECT BREAKDOWN: 

Milestones 

1. Month 1: Learning outcomes: define the standard, implement the linter rule and complete the learning-outcome coverage review and update across the catalogue. Publish to Gutenberg. 

2. Months 2–3: Skills mapping: confirm the SFIA mapping method, implement the metadata and supporting tooling, complete the tagging pass and publish the crosswalk on Gutenberg. 

3. Month 3: Persistent identifiers: confirm the identifier and versioning scheme, integrate Zenodo with the release process, and apply the scheme to the catalogue’s training resources. 

4. Month 3: Reuse and dissemination: publish the schemas, tooling, crosswalk, identifier documentation and methodology to the CHARTED HUB, with adoption guidance for other trainers and platform maintainers. 

Budget:  

1.4 FTE over 3 months. 

Resourcing: The project will be delivered by Alasdair Wilson, a Senior Research Software Engineer in the Oxford Research Software Engineering Group, using the existing Gutenberg and HPCu course-material repositories. No equipment costs are required. Community input will be sought where needed to review the skills-framework mapping. 

Risk analysis: 

- Tagging-accuracy risk: mapping the catalogue onto SFIA accurately benefits from domain input, mitigated by a structured review against SFIA’s documentation, recording the selection rationale and publishing the mapping methodology so that others can evaluate and improve it. 

- Identifier-scheme risk: identifier granularity and versioning (for example, per-course versus per-release) affect long-term usefulness, mitigated by adopting the established Zenodo/GitHub-release pattern rather than creating a bespoke registry. 

- Scope and delivery risk: completing the metadata review, tooling and documentation within three months could create pressure at the end of the project, mitigated by sequencing the learning-outcomes work first, running identifier work in parallel with skills mapping, and treating the documented, reusable implementation as the required final output rather than adding new platform features. 

Costing breakdown: 
 
Learning-outcomes standard, linter rule and coverage completion: 0.3 FTE-months 

SFIA mapping method, metadata, tooling, tagging and crosswalk: 0.7 FTE-months 

Persistent-identifier and versioning scheme, integration and application: 0.3 FTE-months 

Documentation, adoption guidance and CHARTED HUB publication: 0.1 FTE-months 

Total staff effort: 1.4 FTE-months 

At cost: £______ 
 
Project benefits: 

The most immediate benefit will be to learners and trainers using the Gutenberg catalogue. Completing and enforcing learning-outcome metadata will make it easier for independent learners to judge whether a resource is relevant to their aims and current knowledge. Linking resources to SFIA skills will add information about the capabilities they develop, while persistent identifiers will make the resources easier to cite, link to and refer to across releases. This also gives authors a more attributable and recognisable contribution: they can point to a stable, citable version of the training material and gather evidence of its reuse. Trainers will gain a clearer basis for reviewing the catalogue, identifying related material and maintaining the metadata as content changes. 

 
The wider community benefit will come from the project's concrete, open outputs rather than from a claim that one implementation will suit every platform. The project will publish the learning-outcomes convention, the linter rule and tests, the SFIA mapping and selection method, and the identifier and versioning process. These will be directly useful to training repositories that use structured Markdown or similar metadata-driven workflows; other platforms can use the documented fields and methods as a reference when implementing equivalent features in their own systems. The worked example will also show the effort involved, the decisions made and the limitations encountered, giving other providers evidence to decide whether and how to adopt a similar approach. 

The project will contribute a description, progress or methods post, and final outputs to the CHARTED HUB, with open repositories linked where appropriate.  
 
 

 
 
 
 
 