---
title: Documentation
permalink: /development/docs
---

The documentation for gutenberg is a jekykll site, hosted on GitHub pages.

To deploy a local version of the site you will need to:

1. [Install ruby](https://jekyllrb.com/docs/installation/).
2. Install jekyll and bundler:  
   `gem install jekyll bundler`
3. Install the gems by navigating to the `docs` directory and run:  
   `bundle install`
4. Run the site locally with:  
   `bundle exec jekyll serve`
5. Navigate to `localhost:4000` in your browser to view the site.

Note: if you wish to use a page theme you will need to use remote-theme by uncommenting the remote-theme line in `/docs/_config.yml` and commenting out the theme line.
