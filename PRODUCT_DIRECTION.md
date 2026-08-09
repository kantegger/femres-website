# FemRes Product Direction

Last confirmed: 2026-07-19

This document records product decisions that should survive across maintenance
and development sessions.

## Current Priority

Modernize the FemRes web product before beginning the iOS application.

The web work is not a cosmetic reskin. The current experience is organized as a
traditional archive: content-type navigation, repeated card grids, category
indexes, and detail pages. The redesign should turn FemRes into a living,
editorial knowledge product that helps people discover a point of view, follow
ideas across media, and build an ongoing relationship with the collection.

The owner authorized web implementation on 2026-07-19.

## Confirmed Web Direction

- FemRes becomes a continuously updated digital periodical, not a generic
  archive with editorial decoration.
- The homepage represents the current issue. Past issues, the resource library,
  and the personal bookshelf remain distinct destinations.
- The relationship network is part of the periodical reading language. Works,
  concepts, authors, and further reading connect inside the same editorial
  canvas instead of appearing as a separate graph product below it.
- The approved visual system uses a publication grid, expressive serif display
  type, restrained sans-serif interface text, warm paper, near-black ink, and a
  single vermilion accent.
- Avoid a visibly stacked "magazine section plus graph section" composition.
  Relationship lines should behave like citations, marginal notes, and reading
  paths that grow from the cover story.
- The first implemented issue centers on body politics and uses existing FemRes
  resources such as *The Substance*, *The Beauty Myth*, and *Visual Pleasure
  and Narrative Cinema*.
- Fine visual and editorial adjustments are expected after the real responsive
  implementation is reviewed.
- The first detail-page batch extends the same publication system to film
  reading pages: localized titles, a long-form essay column, factual marginalia,
  source links, related-film paths, subscriptions, and discussion remain part
  of one continuous reading surface.
- Book detail pages extend the system as annotated critical editions: the
  localized title and real cover lead, original titles remain secondary
  bibliographic data, and reviews, publication facts, sources, topics, related
  reading, subscriptions, and reader notes form one continuous reading surface.
- Article detail pages use a commentary-broadsheet model: a localized headline,
  standfirst, byline, lead image, source, topic index, long-form argument,
  related reading, subscriptions, and reader letters remain one continuous
  editorial surface rather than returning to generic content cards.
- Video detail pages use a screening-notes model: the playable work or source
  poster leads, programme metadata and topics behave as a viewing index, and
  notes, related screenings, subscriptions, and discussion continue the same
  editorial path without generic media cards or inert playlist controls.
- Podcast detail pages use a listening-edition model: cover art and show identity
  lead into real platform playback, listening notes, an issue index, and a
  related-audio path without generic gradient cards or decorative controls.
- Paper detail pages use an annotated-research model: title, authorship, abstract,
  journal, DOI, paper type, keywords, topics, source access, and related studies
  read as one academic editorial surface rather than a stack of metadata cards.

## Web Redesign Product Read

- Product character: modern editorial publication combined with a personal
  knowledge tool.
- Audience: Chinese- and English-speaking feminist learners, researchers, and
  content workers, with broader localization retained as an asset.
- Primary experience: curated discovery and idea journeys, not browsing a
  warehouse by media type.
- Visual goal: contemporary, confident, culturally literate, and distinctive;
  motion and new browser capabilities should serve meaning and orientation.
- Structural goal: reduce the dominance of repeated cards, boxed sections,
  content-type silos, and long archive pages.
- Trust goal: keep accessibility, multilingual reading, source attribution,
  performance, and sensitive-topic privacy stronger than visual spectacle.

## Redesign Principles

1. Lead with a timely editorial proposition: a daily or weekly focus, a strong
   idea, and a guided way into the collection.
2. Organize around questions, themes, relationships, and learning paths before
   books, films, articles, podcasts, videos, and papers.
3. Treat every resource as part of a connected knowledge graph: related ideas,
   people, works, historical context, and suggested next steps.
4. Give reading pages a calm, high-quality publication experience while making
   exploration surfaces more kinetic and expressive.
5. Use motion for continuity, spatial context, and progressive disclosure. Do
   not add effects solely to signal that the site is modern.
6. Design mobile web as a primary surface, not as a compressed desktop grid.
7. Preserve stable URLs, SEO value, locale routing, and source links through the
   redesign.
8. Establish a coherent design system before converting page families.

## Product Sequence

1. Audit the current visual language, information architecture, content entry
   points, and mobile experience.
2. Define the new product narrative, navigation model, design system, and three
   genuinely different homepage/reading-flow directions.
3. Prototype and validate the selected direction before broad implementation.
4. Rebuild the web experience in controlled page-family batches while
   preserving routes and behavior.
5. Measure discovery depth, return behavior, saves, newsletter conversion, and
   reading continuation.
6. Begin the iOS product only after explicit owner authorization.

## Confirmed iOS Decisions

These decisions are accepted but deferred until the web redesign reaches the
appropriate point and the owner explicitly authorizes iOS development.

- Target audience: initially Chinese- and English-speaking feminist learners,
  researchers, and content workers.
- MVP promise: FemRes Daily plus an offline personal knowledge library.
- Account architecture: retain the current first-party account system and add a
  mobile-specific server API, refresh tokens, secure token storage, and account
  deletion. Do not migrate to Supabase Auth by default.
- Data boundary: iOS must use secure server APIs. It must never connect directly
  with `DATABASE_URL` or depend on the disabled Supabase anonymous Data API
  access.
- Launch business model: free, no advertising, and no external donation button;
  validate retention before testing StoreKit subscriptions.
- Community scope: comments are excluded from the iOS MVP until reporting,
  blocking, filtering, and moderation tooling exist.
- Explicit non-goal: do not build a WebView wrapper or a page-for-page copy of
  the website.

## Decisions Still Open for the Web Redesign

The following should be resolved during design discovery rather than assumed:

- How far the redesign may move away from the current purple/pink brand language.
- The sustainable publication cadence and workflow for assembling each issue.
- How issues are archived and whether issue metadata lives in content files or
  a dedicated collection.
- Which current archive and community surfaces remain first-class, become
  secondary, or stay web-only utilities.
- The level of motion appropriate for accessibility, performance, and the
  seriousness of the subject matter.

## Implemented Redesign Batches

- The film library now behaves as an editorial index rather than a card wall:
  localized titles lead, original titles remain secondary bibliographic data,
  filters and sorting share one data model across locale routes, and the first
  result receives issue-like visual emphasis. A new publication-style footer
  completes the reading surface without restoring the old emoji-heavy UI.
- The book library now extends the same publication system as a research
  bibliography: one lead title establishes editorial hierarchy, the remaining
  covers form a compact shelf, topic discovery stays functional, and the old
  gradient cards and emoji reading guide have become a quieter reference layer.
- The article library now reads as a newspaper index: a lead analysis and two
  supporting headlines establish hierarchy, the remaining essays form a dense
  two-column stream, and existing like and bookmark entry points remain
  available without restoring the previous glass cards or decorative badges.
- The video library now works as an editorial screening programme: one lead
  screening and two supporting selections establish a viewing hierarchy, the
  remaining works form a compact visual catalogue, and topic filters, duration
  sorting, pagination, likes, and bookmarks remain available.
- The podcast library now works as an editorial audio directory: one lead show
  and two supporting selections establish a listening hierarchy, original
  titles remain visible as secondary metadata, and the remaining programmes use
  a compact two-column listening list with filters, pagination, and interactions.
- The paper library now reads as a contemporary academic journal catalogue:
  localized titles remain primary, original titles remain secondary, and
  journal, DOI, year, paper type, citations, topics, sorting, pagination, likes,
  and bookmarks stay intact without returning to a generic card grid.
- Localized resource indexes remain server-rendered so topic, sorting, and
  pagination query parameters work consistently in English, Traditional
  Chinese, Japanese, and French as well as the default Simplified Chinese route.
- Book reading pages now share one five-language editorial implementation. They
  preserve stable routes, SEO markup, source links, interactions, newsletter
  signup, discussion, and related-book discovery while replacing the previous
  generic card-and-sidebar layout with a book-dossier reading experience.
- Article reading pages now share one five-language editorial implementation.
  They preserve stable routes, Article schema markup, original-source links,
  interactions, newsletter signup, discussion, and related-article discovery
  while introducing a distinct newspaper-commentary reading hierarchy.
- Video reading pages now share one five-language editorial implementation.
  They preserve stable routes, VideoObject schema markup, embeddable playback,
  original-platform links, interactions, newsletter signup, discussion, and
  related-video discovery while presenting non-embeddable sources as honest
  poster links instead of broken frames.
- Podcast reading pages now share one five-language editorial implementation.
  They preserve stable routes, PodcastEpisode schema markup, Spotify playback,
  original-platform links, interactions, newsletter signup, discussion, and
  related-audio discovery while keeping non-embeddable sources explicit.
- Paper reading pages now share one five-language editorial implementation. They
  preserve stable routes, ScholarlyArticle schema markup, DOI and journal data,
  source links, interactions, newsletter signup, discussion, and related-study
  discovery in a contemporary research-note layout.

## Design System Consolidation (2026-07)

After the page-family batches, a consolidation pass unified the system:

- **Single token source.** The editorial palette (`--paper`, `--paper-deep`,
  `--ink`, `--muted`, `--line`, `--accent`, plus dark overrides), font stacks
  (`--editorial-serif`, `--editorial-sans`), and a small type scale live once in
  `src/styles/global.css`. Components must not redeclare them. The legacy
  purple/glass-morphism utilities were removed; `prose` was restyled to the
  editorial palette. `src/styles/editorial-cleanup.css` remains the global
  "quiet layer" for institutional pages — component styles must stay compatible
  with it (it hides decorative numbers and strips catalogue borders there).
- **Shared index skeleton.** All six resource indexes (books, films, articles,
  papers, podcasts, videos) render through `src/components/editorial/`:
  `IndexShell` (hero + filters + catalogue + aside), `FilterRow`, `SortSelect`,
  `Pagination`, and `CoverImage`. Per-page code keeps only card-specific styles.
- **Image policy (per media type, enforced by `CoverImage`).** Film posters
  (2/3) and book covers (3/4) are never cropped: `object-fit: contain` on a
  `--paper-deep` mat. Podcast covers are square (1/1 cover), video thumbnails
  16/9 cover, article images 16/9 cover with 3/2 lead images on detail pages.
  Search results, topic rows, and homepage modules follow the same per-type
  rule instead of forcing everything into one crop.
- **Pagination without grid holes.** Featured items (lead, briefs) appear only
  on page 1; the grid page size is 12, divisible by every responsive column
  count (4/3/2/1). `buildTopicListingView` in `src/lib/listing.ts` implements
  this via `featuredCount`: page 1 holds `featuredCount + perPage` items, later
  pages hold `perPage`. Item numbering must derive from the same constants,
  never a hardcoded page size.
- **Institutional pages.** About and Contact keep the editorial aesthetic with
  real imagery (About hero shows a shelf of actual covers/posters), compact
  contact-route cards (no fixed min-heights), a side-by-side FAQ + contact
  details section, and a floor of 13px for body text (11px only for
  letter-spaced micro-labels).
