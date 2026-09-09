---
title: Directives and Links
permalink: /authoring/directives-and-links/
parent: Writing Course Material
nav_order: 3
---

Section content is [GitHub-flavored Markdown](https://docs.github.com/en/get-started/writing-on-github), extended with a small set of directives for challenges, solutions, and callouts. Each directive is a block delimited by three or more colons; the opening and closing fences must use the same number of colons:

```pandoc
:::directive_name

Any markdown content can go here

:::
```

Nest a directive inside another by using one more colon on the outer block than the inner one (see the Solution example below).

## Challenge

```pandoc
::::challenge{id=dot_product title="Example challenge"}

This is an example challenge.

::::
```

`id` must be unique within the section; `title` is shown as the challenge heading. A challenge renders a notes/completion UI backed by the student's progress record, keyed on `id`.

> **Note:** Course/event progress pages and stats (not the challenge itself) rely on a stricter pattern-match over the raw markdown to discover which challenges exist in a section, and it requires `title="..."` in double quotes with `id` present, in either order. Get the syntax slightly wrong — single quotes, a missing `id` — and the challenge will still render and work on its own, it just won't show up in course/event progress tracking or completion tables. When in doubt, copy the example above exactly.

## Solution

```pandoc
:::solution

The answer is 42.

:::
```

Renders as an initially-collapsed block the learner clicks to reveal. Solutions can nest inside a challenge:

```pandoc
::::challenge{id=big_question title="Hitchhikers question"}

What is the answer to life, the universe, and everything?

:::solution
The answer is 42.
:::

::::
```

> **Note:** Unlike `challenge`, `solution` does not currently support a custom `title` attribute — it always renders as "Solution" ([tracked upstream](https://github.com/OxfordRSE/gutenberg/issues/226)).

## Callout

```pandoc
:::callout

More information on Douglas Adams' "The Hitchhiker's Guide to the Galaxy" can be found on [its Wikipedia entry](https://en.wikipedia.org/wiki/The_Hitchhiker%27s_Guide_to_the_Galaxy).

:::
```

Add a `variant` to style it for a specific purpose:

```pandoc
:::callout{variant="warning"}
Text
:::
```

Available variants: `danger`, `warning`, `tip`, `discussion`, `note`, `keypoints`. Leaving `variant` off renders a plain, unstyled callout box.

| variant      | use it for                                                                      |
| ------------ | ------------------------------------------------------------------------------- |
| `danger`     | an action that could break the learner's environment or lose data if done wrong |
| `warning`    | a risk of a breaking change, or a precaution worth taking                       |
| `tip`        | a useful tip that helps with the task or in a wider context                     |
| `discussion` | a discussion prompt or thinking point                                           |
| `note`       | extra information worth bearing in mind                                         |
| `keypoints`  | a summary of the most essential takeaways                                       |

## Internal links

Ordinary markdown links work as usual, but since the deployed base URL varies, links between sections are rewritten automatically rather than needing a full URL:

```markdown
[internal link](theme.id/course.id/section.id)
[with leading slash](/theme.id/course.id/section.id)
[if you forgot to strip .md](/theme.id/course.id/section.id.md)
```

You can also drop an internal URL straight into text using `{% raw %}{{ base_url }}{% endraw %}`:

```markdown
{% raw %}{{ base_url }}{% endraw %}/theme.id/course.id/section.id
```

All of these are prefixed with the deployment's base URL and material repo automatically, so the same markdown works unchanged in development and production. A relative link (`./other-section` or `../sibling-course/section`) resolves relative to the current section's position in the theme/course/section tree.
