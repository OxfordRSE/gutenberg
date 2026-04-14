---
title: Home
nav_order: 1
permalink: /
---

# Gutenberg

<div>
  <p>Gutenberg is a teaching site for presenting structured markdown-based learning material in a dynamic learning platform. It supports self-paced courses built from curated groups of sections, and scheduled events for live teaching, workshops, and cohort delivery.</p>
  <p>Gutenberg is designed to be flexible and adaptable to different teaching contexts, with a focus on simplicity and ease of use for both instructors and learners. It is built on a modern tech stack and can be deployed quickly in various environments, making it accessible for a wide range of educational settings.</p>
</div>

<div class="home-grid">
  <a class="home-card" href="{{ '/about/' | relative_url }}">
    <span class="home-card-title">About Gutenberg</span>
    <span class="home-card-body">What the project is for, where the material comes from, and how courses and events fit together.</span>
  </a>
  <a class="home-card" href="{{ '/concepts/' | relative_url }}">
    <span class="home-card-title">Core Concepts</span>
    <span class="home-card-body">A short explanation of material repositories, courses, events, defaults, and learning context.</span>
  </a>
</div>

## Using Gutenberg

<p class="home-section-note">Start with task-focused guides, then use the fuller guide for reference.</p>
<div class="home-grid">
  <a class="home-card" href="{{ '/how-to/' | relative_url }}">
    <span class="home-card-title">How-To Guides</span>
    <span class="home-card-body">Short guides for common jobs such as creating a course, making an event from a course, or syncing defaults.</span>
  </a>
  <a class="home-card" href="{{ '/guide/' | relative_url }}">
    <span class="home-card-title">User Guide</span>
    <span class="home-card-body">Reference documentation for courses, events, learning context, material navigation, and default-course workflows.</span>
  </a>
</div>

## Deploying and Configuring

<div class="home-grid">
  <a class="home-card" href="{{ '/deployment/' | relative_url }}">
    <span class="home-card-title">Deployment</span>
    <span class="home-card-body">How to run Gutenberg, connect a database, and get a working instance online.</span>
  </a>
  <a class="home-card" href="{{ '/config/' | relative_url }}">
    <span class="home-card-title">Configuration</span>
    <span class="home-card-body">Environment variables, template settings, authentication, and the main knobs you can turn.</span>
  </a>
</div>

## Developing Gutenberg

<div class="home-grid">
  <a class="home-card" href="{{ '/development/' | relative_url }}">
    <span class="home-card-title">Development Guide</span>
    <span class="home-card-body">Local setup, Docker workflows, docs development, and the practical details for hacking on the project.</span>
  </a>
  <a class="home-card" href="{{ '/concepts/' | relative_url }}">
    <span class="home-card-title">Architecture and Concepts</span>
    <span class="home-card-body">The conceptual model behind the application, useful when you want to understand how the pieces relate.</span>
  </a>
</div>

## Recent Changes

<div class="home-grid">
  <a class="home-card" href="{{ '/whats-new/v2-0/' | relative_url }}">
    <span class="home-card-title">What's New in v2.0</span>
    <span class="home-card-body">Overview of the large release that introduced courses, default-course sync, and the newer editing model.</span>
  </a>
  <a class="home-card" href="{{ '/how-to/create-event-from-course/' | relative_url }}">
    <span class="home-card-title">Create an Event from a Course</span>
    <span class="home-card-body">Use a course as a blueprint when you want a scheduled teaching event based on existing material structure.</span>
  </a>
  <a class="home-card" href="{{ '/how-to/sync-default-courses/' | relative_url }}">
    <span class="home-card-title">Sync Default Courses</span>
    <span class="home-card-body">Review the default course catalogue and apply updates to the database from the courses page.</span>
  </a>
  <a class="home-card" href="{{ '/changelog/' | relative_url }}">
    <span class="home-card-title">Changelog</span>
    <span class="home-card-body">Version-by-version release notes for the project.</span>
  </a>
</div>

## Courses and Events

Use **courses** when you want a reusable, self-paced learning path with grouped material and tracked progress. Use **events** when you want to deliver the material to a cohort with dates, locations, enrolment, instructors, and event-specific structure.
