---
title: Documentation
permalink: /development/docs
parent: Development
nav_order: 2
---

The documentation for Gutenberg is a Jekyll site, hosted on GitHub Pages.

The docs site also includes Plausible analytics via the `plausible` block in `docs/_config.yml` and the theme hook at `docs/_includes/head_custom.html`.

To deploy a local version of the site you will need to:

1. [Install ruby](https://jekyllrb.com/docs/installation/).
2. Install jekyll and bundler:  
   `gem install jekyll bundler`
3. Install the gems by navigating to the `docs` directory and run:  
   `bundle install`
4. Run the site locally with:  
   `bundle exec jekyll serve`
5. Navigate to `localhost:4000` in your browser to view the site.

From the repository root you can also use:

- `yarn docs` to serve the site locally
- `yarn docs:build` to build the site into `docs/_site`

Note: if you wish to use a page theme you will need to use remote-theme by uncommenting the remote-theme line in `/docs/_config.yml` and commenting out the theme line.
