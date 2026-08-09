# FemRes Content Entry Templates

Use this document when adding or localizing resources. It is intentionally
operational: copy the closest template, replace placeholders, then run the
checks before committing.

## Batch Checklist

Before writing:

- Run `npm run content:audit`.
- Pick one coverage pillar and plan across 3-4 collections by default.
- For routine expansion, gather 40-60 candidate sources and select at least 20
  source resources for one commit. Add each selected resource across all five
  locales when the site is locale-balanced.
- Include at least one non-paper collection by default; use papers for depth,
  not as a comfort zone that avoids image/source work.
- Timebox routine expansion around 15-20 minutes of active work. If image/R2
  work, source conflicts, topic/schema changes, or validation failures expand
  the risk, reduce scope to 12-16 source resources and finish cleanly.
- Use one-resource batches only for trials, high-risk sources, image/R2
  workflow tests, or explicit user requests.
- Check existing coverage with `rg -n "Resource Title|Author Name|Topic Name" src/content src/i18n/topicsMapping.json`.
- Use primary or canonical sources first: publisher, journal, DOI, official film
  page, official platform, institutional page, archive, or creator page.
- Browse for dates, availability, awards, URLs, and recent facts.
- Record the original resource language in `contentLanguage`; do not use page
  locale as a proxy.

Before commit:

```bash
npm run content:audit
npm run lint
npm run build
git diff --check
git diff --stat
```

Commit once per coherent editorial batch, not once per resource. A normal
throughput batch is at least 20 source resources, usually 100-120 locale files
across 3-4 collections.

## Locale Rules

Use one base slug for the resource:

- `resource-slug.md`: Simplified Chinese page
- `resource-slug-en.md`: English page
- `resource-slug-tw.md`: Traditional Chinese page
- `resource-slug-ja.md`: Japanese page
- `resource-slug-fr.md`: French page

Keep facts stable across locale variants:

- Same source URL, publication date, release date, DOI, ISBN, platform URL, and
  original creator credits unless the source itself differs.
- Same canonical English `topics` array across all locale variants.
- Localize `title`, `description`, body text, country, duration labels, genre,
  cast display names, and awards when appropriate.
- Keep `originalTitle` when the displayed title is translated or romanized.

## Topic Rules

Use canonical English topic keys in frontmatter.

Before adding a new topic:

```bash
rg -n "\"New Topic\"" src/content src/i18n/topicsMapping.json
```

If the topic is genuinely new, add it to `src/i18n/topicsMapping.json` with
`en`, `zh-CN`, `zh-TW`, `ja`, `fr`, and `icon`, then run
`npm run content:audit`.

Prioritize these coverage directions when accurate, but verify each topic key
with `rg` before using it:

- Disability Justice, Women's Health, Medical Patriarchy Critique
- Indigenous Feminism, Decolonial Feminism, Climate Justice
- Caste and Gender, Class and Gender, Labor Rights
- Migration, Domestic Labor, Care Economy, Global Feminism
- Carceral Feminism, Prison Abolition, Anti-Sexual Violence
- War and Militarism, Political Participation, Human Rights
- Digital Feminism, Algorithmic Bias, AI Ethics, Technology Critique
- Ecofeminism, Climate Justice, Resource Extraction

## Summary Standard

Body text should explain:

- What the resource is.
- Which feminist problem, debate, tradition, or movement it illuminates.
- Its historical, geographic, linguistic, or institutional context.
- What is distinctive about its argument, form, evidence, or method.
- Who would use it and what limits or tensions a serious reader should notice.

Do not copy publisher copy verbatim. Paraphrase and synthesize.

## Image Rules

Image fields are optional. Add them only when the image is source-backed,
rights-safe, stable, and useful for recognition. If no suitable image is
available, omit the image field and let the UI fallback render.

Preferred sources:

- Existing FemRes CDN asset:
  `https://media.femres.org/images/{collection}/{resource-slug}.jpg`
- Official publisher, journal, museum, distributor, festival, creator, platform,
  or institution media pages.
- Open-license or public-domain repositories with clear rights.
- Canonical cover/poster metadata pages or retailer pages such as Amazon,
  Google Books, Open Library, WorldCat, IMDb, or distributor pages when no
  better official asset is available.

Avoid search-result thumbnails, social preview cache URLs, unstable signed CDN
URLs, fan uploads, watermarked images, affiliate image URLs, and any image with
unclear rights.

Target display ratios:

- Books `coverImage`: 2:3 vertical cover, ideally 800x1200 or larger.
- Films `posterImage`: 2:3 vertical poster, ideally 800x1200 or larger.
- Videos `thumbnail`: 16:9 landscape, ideally 1280x720 or larger.
- Podcasts `thumbnail`: square artwork, ideally 800x800 or larger.
- Articles `featuredImage`: landscape with centered subject; detail pages crop
  to 21:9 and cards crop to square, so prefer 1600px wide or larger.
- Papers: no image field in the current schema.

When using a `media.femres.org` path, make sure the asset has actually been
uploaded to Cloudflare R2 or already exists. Do not write a CDN path as a
placeholder for a file that is not present.

R2 upload commands:

```bash
npm run upload:r2:single <localFilePath> images/<collection>/<resource-slug>.jpg
npm run upload:r2
```

The upload scripts load `.env.local` or `.env` and require `R2_ACCOUNT_ID`,
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and optionally
`R2_BUCKET_NAME`. The production media bucket is currently `femres`, so set
`R2_BUCKET_NAME=femres` unless the deployment config changes. After upload,
verify the public URL before using it in frontmatter:

```text
https://media.femres.org/images/<collection>/<resource-slug>.jpg
```

If using Wrangler directly instead of the npm scripts, include `--remote`.
Without `--remote`, Wrangler can write to a local simulated R2 store and still
print "Upload complete":

```bash
npx wrangler r2 object put femres/images/books/<resource-slug>.jpg \
  --file /path/to/cover.jpg \
  --content-type image/jpeg \
  --remote
```

Use collection folders that match the schema field:

- Books: `images/books/{slug}.jpg` -> `coverImage`
- Articles: `images/articles/{slug}.jpg` -> `featuredImage`
- Films: `images/films/{slug}.jpg` -> `posterImage`
- Videos: `images/videos/{slug}.jpg` -> `thumbnail`
- Podcasts: `images/podcasts/{slug}.jpg` -> `thumbnail`

Retail cover workflow for books:

- Prefer publisher and library images first. Use Amazon only when it provides
  the clearest edition-matched cover or when publisher/library assets are poor.
- Use the product page image or page metadata to identify the highest-quality
  cover for the exact ISBN/edition. Avoid search result thumbnails.
- Do not hotlink temporary, signed, resized, or tracking-heavy image URLs.
  If the image is needed, upload a normalized 2:3 cover asset to R2 with
  `npm run upload:r2:single <localFilePath> images/books/{slug}.jpg`, then use
  `https://media.femres.org/images/books/{slug}.jpg`.
- Normalize covers to a clean 2:3 crop, ideally 800x1200 or larger, with no
  browser chrome, marketplace UI, watermark, or extra background.
- If no rights-safe or stable image workflow is available, omit `coverImage`.

## Book Template

```md
---
title: "Localized Display Title"
originalTitle: "Original Title"
author: "Author Name"
description: "One concise sentence explaining the resource's feminist value."
publishDate: YYYY-MM-DD
contentLanguage: "en"
topics: ["Topic One", "Topic Two", "Topic Three"]
isbn: "ISBN when reliable"
coverImage: "https://media.femres.org/images/books/resource-slug.jpg"
sourceUrl: "https://canonical.publisher-or-library-url.example"
status: "published"
---

Analytical body text.
```

Notes:

- Prefer publisher, library, WorldCat, ISBN, or author pages over retail pages.
- Use retail URLs only when no better source exists.
- Keep ISBN tied to the edition represented by the source.

## Article Template

```md
---
title: "Localized Display Title"
author: "Author or Institution"
description: "One concise sentence explaining the article's feminist value."
publishDate: YYYY-MM-DD
contentLanguage: "en"
topics: ["Topic One", "Topic Two", "Topic Three"]
sourceUrl: "https://canonical.article-url.example"
readingTime: 8
featuredImage: "https://media.femres.org/images/articles/resource-slug.jpg"
status: "published"
---

Analytical body text.
```

Notes:

- Use the original article, report, or institutional explainer URL.
- Estimate `readingTime` conservatively if the source does not provide one.
- For recent policy or news-adjacent resources, verify the date and source.

## Film Template

```md
---
title: "Localized Display Title"
originalTitle: "Original Title"
director: "Director Name"
description: "One concise sentence explaining the film's feminist value."
releaseDate: YYYY-MM-DD
year: YYYY
country: "Country"
duration: "120 min"
contentLanguage: "en"
genre: ["Drama", "Documentary"]
cast: ["Actor One", "Actor Two"]
topics: ["Topic One", "Topic Two", "Topic Three"]
sourceUrl: [
  { platform: "IMDb", url: "https://www.imdb.com/title/..." }
]
posterImage: "https://media.femres.org/images/films/resource-slug.jpg"
awards: ["Award when source-backed"]
imdbRating: "7.8"
doubanRating: "8.1"
status: "published"
---

Analytical body text.
```

Notes:

- Prefer official film, distributor, festival, IMDb, Letterboxd-style canonical,
  or archive pages.
- Keep ratings optional and source-backed.
- Do not invent platform availability.

## Video Template

```md
---
title: "Localized Display Title"
author: "Speaker, Creator, or Channel"
description: "One concise sentence explaining the video's feminist value."
publishDate: YYYY-MM-DD
contentLanguage: "en"
topics: ["Topic One", "Topic Two", "Topic Three"]
sourceUrl: "https://canonical.video-url.example"
embedUrl: "https://www.youtube.com/embed/..."
duration: 20
thumbnail: "https://media.femres.org/images/videos/resource-slug.jpg"
status: "published"
---

Analytical body text.
```

Notes:

- `duration` is numeric minutes unless the existing source pattern requires a
  specific value.
- Prefer official channel pages or institutional video pages.
- Avoid adding videos that only summarize another source unless they add clear
  pedagogical value.

## Podcast Template

```md
---
title: "Localized Display Title"
originalTitle: "Original Title"
author: "Host, Show, or Organization"
description: "One concise sentence explaining the podcast's feminist value."
publishDate: YYYY-MM-DD
contentLanguage: "en"
topics: ["Topic One", "Topic Two", "Topic Three"]
sourceUrl: "https://open.spotify.com/show/..."
audioUrl: "https://optional-audio-url.example"
embedUrl: "https://open.spotify.com/embed/show/..."
duration: 45
transcript: "Transcript URL or note when available"
thumbnail: "https://media.femres.org/images/podcasts/resource-slug.jpg"
episodeNumber: 1
status: "published"
---

Analytical body text.
```

Notes:

- Distinguish show-level resources from episode-level resources.
- When Spotify carries the resource, use its playback page for `sourceUrl` and
  the matching player URL for `embedUrl`.
- A show-level resource uses matching Spotify `/show/` URLs. An episode-level
  resource uses the exact matching `/episode/` URLs; never replace a specific
  episode with the whole show page.
- Verify hosts, program background, publication dates, and content claims using
  the author or show website, RSS feed, or production organization page. These
  editorial verification sources do not replace the front-end playback fields.
- If Spotify is unavailable, use Apple Podcasts, an official player,
  SoundCloud, or a direct audio URL.
- If verification sources become visible in the product, add a separate
  optional `officialUrl` instead of overloading `sourceUrl`.
- Use `episodeNumber` only for a specific episode.
- Do not use podcasts as filler; the episode or show should add a distinct
  voice, archive, interview, or movement perspective.

## Paper Template

```md
---
title: "Localized Display Title"
originalTitle: "Original Title"
author: "Author One, Author Two"
description: "One concise sentence explaining the paper's feminist value."
publishDate: YYYY-MM-DD
contentLanguage: "en"
topics: ["Topic One", "Topic Two", "Topic Three"]
sourceUrl: "https://doi.org/... or canonical journal page"
doi: "10.xxxx/xxxxx"
journal: "Journal or Conference"
abstract: "Paraphrased or source-backed abstract summary."
keywords: ["keyword one", "keyword two"]
citationCount: 0
paperType: "research"
status: "published"
---

Analytical body text.
```

Notes:

- Prefer DOI, journal, proceedings, repository, or institution pages.
- `paperType` must be one of `research`, `review`, `case-study`, or
  `theoretical`.
- Avoid citation counts unless current and sourced.
