import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const outputDir = new URL("../dist/client/", import.meta.url);
const readOutput = (path) => readFile(new URL(path, outputDir), "utf8");

const [sitemap, robots, bingVerification, ads, profilePage, bookPage] =
  await Promise.all([
    readOutput("sitemap-0.xml"),
    readOutput("robots.txt"),
    readOutput("BingSiteAuth.xml"),
    readOutput("ads.txt"),
    readOutput("en/profile/index.html"),
    readOutput("en/books/gender-trouble/index.html"),
  ]);

const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => match[1],
);

assert.ok(sitemapUrls.length > 1_000, "sitemap should contain the public archive");
assert.ok(
  sitemapUrls.every((url) => url.startsWith("https://www.femres.org/")),
  "sitemap URLs must use the canonical production origin",
);
assert.equal(
  sitemapUrls.some((url) => new URL(url).pathname.startsWith("/zh-CN/")),
  false,
  "default-language duplicate routes must not enter the sitemap",
);
assert.equal(
  sitemapUrls.some((url) =>
    /^\/(?:en\/|ja\/|fr\/|zh-TW\/)?(?:profile(?:\/|$)|search\/?$|unsubscribe(?:\/|$)|404(?:\/|$))/.test(
      new URL(url).pathname,
    ),
  ),
  false,
  "private and utility pages must not enter the sitemap",
);
assert.match(sitemap, /<xhtml:link rel="alternate" hreflang="zh-CN"/);
assert.match(sitemap, /<xhtml:link rel="alternate" hreflang="en"/);
assert.match(sitemap, /<xhtml:link rel="alternate" hreflang="ja"/);
assert.match(sitemap, /<xhtml:link rel="alternate" hreflang="fr"/);
assert.match(sitemap, /<xhtml:link rel="alternate" hreflang="zh-TW"/);

const sitemapStats = await stat(new URL("sitemap-0.xml", outputDir));
assert.ok(sitemapStats.size < 50_000_000, "sitemap must stay below the 50 MB limit");

assert.match(robots, /Sitemap: https:\/\/www\.femres\.org\/sitemap-index\.xml/);
assert.match(robots, /Disallow: \/api\//);
assert.equal(
  bingVerification.trim(),
  '<?xml version="1.0"?>\n<users>\n\t<user>4329F6DB7DECDF1C2A396432B22857FB</user>\n</users>',
);
assert.match(
  ads,
  /^google\.com, pub-2079107911432321, DIRECT, f08c47fec0942fa0$/m,
);

assert.match(profilePage, /<meta name="robots" content="noindex, follow">/);
assert.doesNotMatch(profilePage, /hreflang=/);

assert.match(
  bookPage,
  /<link rel="canonical" href="https:\/\/www\.femres\.org\/en\/books\/gender-trouble\/">/,
);
assert.match(bookPage, /<meta property="og:type" content="article">/);
assert.match(bookPage, /<meta name="twitter:card" content="summary_large_image">/);
assert.match(bookPage, /<script type="application\/ld\+json">/);
assert.doesNotMatch(bookPage, /127\.0\.0\.1|localhost/);

console.log(`SEO output verified across ${sitemapUrls.length} sitemap URLs.`);
