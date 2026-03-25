---
title: Changelog
permalink: /changelog
nav_order: 10
---

## v2.0

Gutenberg v2.0 is a substantial rewrite: Events are no longer the only teaching model with this release adding courses as a separate self-paced model while keeping events for scheduled cohort delivery.

See [What's New in Gutenberg v2.0]({{ "/whats-new/v2-0/" | relative_url }}) for the broader release overview.

### New in 2.0

- Added self-paced courses as a new teaching model alongside events.
- Added new course database tables and API routes.
- Added a new EventSwitcher component, improving on the previous dropdown and making it reusable for courses as well as events.
- Added a `/courses` area for browsing all courses, including admin handling for hidden courses.
- Added a curated default course catalog based on current material.
- Added course detail pages with enrolment-aware views, progress, tags, languages, breadcrumbs, and front-page course surfaces.
- Added grouped one-page course editing and improved JSON import guidance around grouped material.
- Added course import and export as JSON.
- Added course enrolment, unenrolment, completion, and better progress handling.
- Added course sorting and filtering by search, level, tags, and languages.
- Added active course selection, enrolment-aware course actions, and better course surfaces on the home page and course list.
- Added active course state in local storage and course switching alongside events.
- Added course-aware sidebar views and material-page hints when a section belongs to a course.
- Added batched course progress fetching for list-style views.
- Added default-course sync with review of unchanged, new, and changed courses.
- Added Course-aware previous/next material navigation and return-to-course behavior.
- Added Material-page course hints and course-aware actions.

### Fixed in 2.0

- Event creation from a course blueprint as well as blank-event creation.
- Event-group material editing moved into the main event edit page so groups and material can be managed inline.
- Event authoring made more consistent with the grouped course model.
- Active learning context for courses and events.

- Sidebar behavior improved so course and event context is surfaced more consistently while navigating.
- Seed data was replaced with more realistic course content.
- Course APIs, slug handling, and add-course error handling were tightened up.
- Course access, enrolment, sync, export, filter, and progress test coverage was expanded substantially.
- Accessibility fixes landed across the new course and event UI, including component roles and related interaction tests.
- The docs were rewritten to represent the new course model.
- Local setup documentation improved for databases, seeds, and material checkout.

## v1.2

### New in 1.2

- Added dynamic internal links [#329](https://github.com/OxfordRSE/gutenberg/pull/329)
- Added support for relative links in markdown [#347](https://github.com/OxfordRSE/gutenberg/pull/347)
- Improved the table of contents and previous/next links on small devices [#343](https://github.com/OxfordRSE/gutenberg/pull/343)
- Added unique page titles [#358](https://github.com/OxfordRSE/gutenberg/pull/358)
- Adopted Flowbite CSS to improve page loads [#361](https://github.com/OxfordRSE/gutenberg/pull/361)
- Added enrolment buttons to the event page [#363](https://github.com/OxfordRSE/gutenberg/pull/363)
- Added active event selection and toggle actions to the sidebar [#364](https://github.com/OxfordRSE/gutenberg/pull/364)
- Added problem view and submission modals [#390](https://github.com/OxfordRSE/gutenberg/pull/390)
- Improved cron runs with startup execution and status reporting [#393](https://github.com/OxfordRSE/gutenberg/pull/393)
- Added event filtering in the event timeline [#396](https://github.com/OxfordRSE/gutenberg/pull/396)
- Added Oxford SSO as an OAuth provider [#431](https://github.com/OxfordRSE/gutenberg/pull/431)
- Added navigation to the new event after creation [#415](https://github.com/OxfordRSE/gutenberg/pull/415)
- Added anchor links to the event page [#438](https://github.com/OxfordRSE/gutenberg/pull/438)
- Added more logos to the breadcrumb, sidebar, and main page [#440](https://github.com/OxfordRSE/gutenberg/pull/440)
- Added README visits badge [#452](https://github.com/OxfordRSE/gutenberg/pull/452)
- Added event page navigation [#459](https://github.com/OxfordRSE/gutenberg/pull/459)

### Fixed in 1.2

- Fixed recursive Prisma typing so `tsc` passes cleanly [#336](https://github.com/OxfordRSE/gutenberg/pull/336)
- Fixed download links being detected as domain names [#349](https://github.com/OxfordRSE/gutenberg/pull/349)
- Fixed home page heading structure for accessibility [#360](https://github.com/OxfordRSE/gutenberg/pull/360)
- Pre-rendered event times for WAVE accessibility checks [#359](https://github.com/OxfordRSE/gutenberg/pull/359)
- Fixed event timeline buttons for accessibility [#362](https://github.com/OxfordRSE/gutenberg/pull/362)
- Adjusted relative URL handling for diagram mode and cleaned up link handling [#354](https://github.com/OxfordRSE/gutenberg/pull/354)
- Added built-site link checking in CI and made broken-link parsing more robust [#352](https://github.com/OxfordRSE/gutenberg/pull/352), [#365](https://github.com/OxfordRSE/gutenberg/pull/365), [#381](https://github.com/OxfordRSE/gutenberg/pull/381)
- Preserved event group ids on edit [#377](https://github.com/OxfordRSE/gutenberg/pull/377)
- Saved `UserOnEvent` statuses on event edit [#380](https://github.com/OxfordRSE/gutenberg/pull/380)
- Fixed broken solution ids [#388](https://github.com/OxfordRSE/gutenberg/pull/388)
- Updated the search system to comply with OpenAI changes [#392](https://github.com/OxfordRSE/gutenberg/pull/392)
- Moved `mat.json` to a temporary path [#394](https://github.com/OxfordRSE/gutenberg/pull/394)
- Hid login text when a session is active [#398](https://github.com/OxfordRSE/gutenberg/pull/398)
- Stopped older events being hidden when an active filter is applied [#399](https://github.com/OxfordRSE/gutenberg/pull/399)
- Changed enrolment key checking to use a new API route [#401](https://github.com/OxfordRSE/gutenberg/pull/401)
- Fixed the user account menu for accessibility [#404](https://github.com/OxfordRSE/gutenberg/pull/404)
- Used client-side routing from the sidebar and content pages [#410](https://github.com/OxfordRSE/gutenberg/pull/410)
- Cleaned up `TableOfContents` accessibility [#412](https://github.com/OxfordRSE/gutenberg/pull/412)
- Removed `NEXT_PUBLIC_MATERIAL_URL` environment variable [#417](https://github.com/OxfordRSE/gutenberg/pull/417)
- Cached material data to improve build speed [#418](https://github.com/OxfordRSE/gutenberg/pull/418)
- Reworked string similarity and reverted the first replacement attempt [#422](https://github.com/OxfordRSE/gutenberg/pull/422), [#449](https://github.com/OxfordRSE/gutenberg/pull/449), [#450](https://github.com/OxfordRSE/gutenberg/pull/450)
- Updated dependencies and documentation gems, including Next.js, NextAuth, `@babel/runtime`, `nokogiri`, `rexml`, `js-yaml`, `mdast-util-to-hast`, and `preact` [#334](https://github.com/OxfordRSE/gutenberg/pull/334), [#330](https://github.com/OxfordRSE/gutenberg/pull/330), [#338](https://github.com/OxfordRSE/gutenberg/pull/338), [#366](https://github.com/OxfordRSE/gutenberg/pull/366), [#376](https://github.com/OxfordRSE/gutenberg/pull/376), [#368](https://github.com/OxfordRSE/gutenberg/pull/368), [#378](https://github.com/OxfordRSE/gutenberg/pull/378), [#384](https://github.com/OxfordRSE/gutenberg/pull/384), [#389](https://github.com/OxfordRSE/gutenberg/pull/389), [#405](https://github.com/OxfordRSE/gutenberg/pull/405), [#407](https://github.com/OxfordRSE/gutenberg/pull/407), [#423](https://github.com/OxfordRSE/gutenberg/pull/423), [#430](https://github.com/OxfordRSE/gutenberg/pull/430), [#444](https://github.com/OxfordRSE/gutenberg/pull/444), [#446](https://github.com/OxfordRSE/gutenberg/pull/446), [#451](https://github.com/OxfordRSE/gutenberg/pull/451), [#458](https://github.com/OxfordRSE/gutenberg/pull/458)
- Updated build and deploy workflows, moved Corepack earlier in deploy, and moved to standalone Next builds on Node 24 [#427](https://github.com/OxfordRSE/gutenberg/pull/427), [#428](https://github.com/OxfordRSE/gutenberg/pull/428), [#436](https://github.com/OxfordRSE/gutenberg/pull/436)
- Improved comment thread accessibility and moved comment popovers to the popover API [#429](https://github.com/OxfordRSE/gutenberg/pull/429), [#441](https://github.com/OxfordRSE/gutenberg/pull/441)
- Updated Docker workflow docs and cleaned up link excludes and dead SVG handling [#432](https://github.com/OxfordRSE/gutenberg/pull/432), [#435](https://github.com/OxfordRSE/gutenberg/pull/435)
- Fixed text selections containing DOM nodes [#443](https://github.com/OxfordRSE/gutenberg/pull/443)
- Handled null comment threads to prevent crashes [#453](https://github.com/OxfordRSE/gutenberg/pull/453)
- Fixed security alerts, including the `qs` upgrade [#454](https://github.com/OxfordRSE/gutenberg/pull/454), [#457](https://github.com/OxfordRSE/gutenberg/pull/457)

## v1.1

### New in 1.1

- Updated the package ecosystem for Node 22 [#298](https://github.com/OxfordRSE/gutenberg/pull/298)

### Fixed in 1.1

- Ran DB migrations correctly in the Docker dev image [#319](https://github.com/OxfordRSE/gutenberg/pull/319)
- Fixed Cypress async configuration [#331](https://github.com/OxfordRSE/gutenberg/pull/331)
- Fixed the lockfile [#335](https://github.com/OxfordRSE/gutenberg/pull/335)

## v1.0

### New in 1.0

- Added automatically generated, interactive table of contents on section pages [#252](https://github.com/OxfordRSE/gutenberg/pull/252)
- Added completely new interactive comment table on events page [#271](https://github.com/OxfordRSE/gutenberg/pull/271)
- Added delete account option [#253](https://github.com/OxfordRSE/gutenberg/pull/253)
- Added redirect from old to new URL [#248](https://github.com/OxfordRSE/gutenberg/pull/248)
- Made theme cards equal height [#242](https://github.com/OxfordRSE/gutenberg/pull/242)
- Wrapped course grids in nav landmarks [#241](https://github.com/OxfordRSE/gutenberg/pull/241)
- Added anchor links to all headings in a section [#247](https://github.com/OxfordRSE/gutenberg/pull/247)
- Changed default material browsing to Grid [#238](https://github.com/OxfordRSE/gutenberg/pull/238)
- Various mobile UI improvements [#235](https://github.com/OxfordRSE/gutenberg/pull/235)
- Styling improvements on previous and next buttons [#236](https://github.com/OxfordRSE/gutenberg/pull/236)
- Styling improvements on course outcomes [#233](https://github.com/OxfordRSE/gutenberg/pull/233)
- Python script to fetch material [#201](https://github.com/OxfordRSE/gutenberg/pull/201)
- Proxied Plausible to a local route (adblock reasons) [#222](https://github.com/OxfordRSE/gutenberg/pull/222)
- Vastly improved adding and reordering materials in event group [#221](https://github.com/OxfordRSE/gutenberg/pull/221)
- Added a user profile page [#219](https://github.com/OxfordRSE/gutenberg/pull/219)
- Docker compose file for alternative deployments [#215](https://github.com/OxfordRSE/gutenberg/pull/215)
- Skip to main content link for accessibility [#207](https://github.com/OxfordRSE/gutenberg/pull/207)
- Accessible page header [#205](https://github.com/OxfordRSE/gutenberg/pull/205)
- Page language attribute on HTML element [#203](https://github.com/OxfordRSE/gutenberg/pull/203)
- Learning outcomes displayed at the top of sections [#202](https://github.com/OxfordRSE/gutenberg/pull/202)
- Accessible names for navigation and theme toggle [#200](https://github.com/OxfordRSE/gutenberg/pull/200)
- E2E tests for create/delete events and paragraph component tests [#112](https://github.com/OxfordRSE/gutenberg/pull/112)
- Nullable enrollment key [#101](https://github.com/OxfordRSE/gutenberg/pull/101)
- Plausible analytics tracking [#175](https://github.com/OxfordRSE/gutenberg/pull/175)
- HTML template for title [#174](https://github.com/OxfordRSE/gutenberg/pull/174)
- Previous/next navigation links in sections [#162](https://github.com/OxfordRSE/gutenberg/pull/162)
- Mouse over navigation in navbar [#166](https://github.com/OxfordRSE/gutenberg/pull/166)
- Automatic hiding of older events [#157](https://github.com/OxfordRSE/gutenberg/pull/157)
- New callout styles [#156](https://github.com/OxfordRSE/gutenberg/pull/156)
- Docs added [#115](https://github.com/OxfordRSE/gutenberg/pull/115)
- Quality workflow [#129](https://github.com/OxfordRSE/gutenberg/pull/129)
- Ability to create comment threads on list items [#139](https://github.com/OxfordRSE/gutenberg/pull/139)
- Duplicate existing events [#144](https://github.com/OxfordRSE/gutenberg/pull/144)
- Event timeline delete button [#106](https://github.com/OxfordRSE/gutenberg/pull/106)
- Autofocus on textareas when writing or editing comments [#109](https://github.com/OxfordRSE/gutenberg/pull/109)
- Enrolment via secret key [#90](https://github.com/OxfordRSE/gutenberg/pull/90)
- Edit source button linking to material in GitHub repo [#49](https://github.com/OxfordRSE/gutenberg/pull/49)
- Tags when choosing items from event group [#52](https://github.com/OxfordRSE/gutenberg/pull/52)
- Top-level material reorganization to cards instead of React Flow [#47](https://github.com/OxfordRSE/gutenberg/pull/47)

### Fixed in 1.0

- Fixed various Next.js hydration errors [#254](https://github.com/OxfordRSE/gutenberg/pull/254)
- Fixed broken CSS on system default light mode and background colors in `_document.tsx` [#267](https://github.com/OxfordRSE/gutenberg/pull/267)
- Code headings padding issue [#249](https://github.com/OxfordRSE/gutenberg/pull/249)
- Navigation accessibility issues [#211](https://github.com/OxfordRSE/gutenberg/pull/211)
- API search page [#225](https://github.com/OxfordRSE/gutenberg/pull/225)
- Semantic HTML headings [#196](https://github.com/OxfordRSE/gutenberg/pull/196)
- Avatar tooltips on events problems table with lazy loading [#102](https://github.com/OxfordRSE/gutenberg/pull/102)
- Enrollment key bug [#153](https://github.com/OxfordRSE/gutenberg/pull/153)
- Corepack deploy [#147](https://github.com/OxfordRSE/gutenberg/pull/147)
- Reply button disable when editing a comment [#135](https://github.com/OxfordRSE/gutenberg/pull/135)
- URL fixes for multi-repo switch [#136](https://github.com/OxfordRSE/gutenberg/pull/136)
- Material UI datepicker swap [#134](https://github.com/OxfordRSE/gutenberg/pull/134)
- LocalStorage swap for active event state [#108](https://github.com/OxfordRSE/gutenberg/pull/108)
- Prevent problems with same tag from conflicting on completion [#107](https://github.com/OxfordRSE/gutenberg/pull/107)
- Build errors due to yarn.lock issues [#99](https://github.com/OxfordRSE/gutenberg/pull/99)
- Only return `useronevents` for selected event [#96](https://github.com/OxfordRSE/gutenberg/pull/96)
- Thread with no comments issue [#85](https://github.com/OxfordRSE/gutenberg/pull/85)
- Event page tick marks [#80](https://github.com/OxfordRSE/gutenberg/pull/80)
- `useEffect` problems in dependency arrays [#71](https://github.com/OxfordRSE/gutenberg/pull/71)
- `select event` button appearing over sidebar [#72](https://github.com/OxfordRSE/gutenberg/pull/72)
- Cypress errors from ResizeObserver [#68](https://github.com/OxfordRSE/gutenberg/pull/68)
- Build speed improvements in Docker [#68](https://github.com/OxfordRSE/gutenberg/pull/68)
- Remove active event from storage when unset [#46](https://github.com/OxfordRSE/gutenberg/pull/46)
- Copyright always up to date [#150](https://github.com/OxfordRSE/gutenberg/pull/150)
- Padding changes for markdown rendering [#133](https://github.com/OxfordRSE/gutenberg/pull/133)
- Instructor view to show all students in sidebar [#105](https://github.com/OxfordRSE/gutenberg/pull/105)
- Performance improvements on events problems table [#98](https://github.com/OxfordRSE/gutenberg/pull/98)
