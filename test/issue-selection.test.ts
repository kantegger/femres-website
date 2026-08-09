import assert from "node:assert/strict";
import test from "node:test";
import {
  getIssueBodyItems,
  selectIssueItems,
  type IssueMediaQuotas,
} from "../src/lib/issueSelection";

type TestItem = Parameters<typeof selectIssueItems>[0][number];

function item(
  cleanSlug: string,
  contentType: TestItem["contentType"],
  date: string,
  topics = ["Body Politics"],
): TestItem {
  return {
    id: `${cleanSlug}-en`,
    slug: `${cleanSlug}-en`,
    cleanSlug,
    contentType,
    title: cleanSlug,
    author: "FemRes",
    description: "Test resource",
    date: new Date(date),
    topics,
    original: {} as TestItem["original"],
  };
}

const balancedQuotas: IssueMediaQuotas = {
  book: 2,
  film: 2,
  article: 1,
  video: 1,
  podcast: 1,
  paper: 1,
};

test("issue selection enforces media quotas before the global item limit", () => {
  const content = [
    ...Array.from({ length: 6 }, (_, index) =>
      item(`podcast-${index}`, "podcast", `2026-01-${String(20 - index).padStart(2, "0")}`),
    ),
    item("book-1", "book", "2025-12-01"),
    item("book-2", "book", "2025-11-01"),
    item("film-1", "film", "2025-10-01"),
    item("film-2", "film", "2025-09-01"),
    item("article-1", "article", "2025-08-01"),
    item("video-1", "video", "2025-07-01"),
    item("paper-1", "paper", "2025-06-01"),
  ];

  const selected = selectIssueItems(
    content,
    ["Body Politics"],
    { mediaQuotas: balancedQuotas },
    8,
  );
  const counts = selected.reduce<Record<string, number>>((result, entry) => {
    result[entry.contentType] = (result[entry.contentType] ?? 0) + 1;
    return result;
  }, {});

  assert.equal(selected.length, 8);
  assert.deepEqual(counts, {
    podcast: 1,
    book: 2,
    film: 2,
    article: 1,
    video: 1,
    paper: 1,
  });
});

test("curated anchors survive date sorting and may extend the topic query", () => {
  const selected = selectIssueItems(
    [
      item("new-book", "book", "2026-01-01"),
      item("second-new-book", "book", "2025-01-01"),
      item("foundational-book", "book", "1990-01-01", ["Media Representation Critique"]),
      item("film", "film", "2024-01-01"),
      item("article", "article", "2024-01-01"),
      item("video", "video", "2024-01-01"),
      item("podcast", "podcast", "2024-01-01"),
      item("paper", "paper", "2024-01-01"),
    ],
    ["Body Politics"],
    {
      mediaQuotas: balancedQuotas,
      curatedSlugs: ["foundational-book"],
    },
    8,
  );

  assert.equal(selected[0]?.cleanSlug, "foundational-book");
  assert(selected.some((entry) => entry.cleanSlug === "new-book"));
  assert(!selected.some((entry) => entry.cleanSlug === "second-new-book"));
});

test("issues without quotas keep relevance and date ranking", () => {
  const selected = selectIssueItems(
    [
      item("newer", "book", "2026-01-01"),
      item("more-relevant", "film", "2020-01-01", ["Body Politics", "Bodily Autonomy"]),
      item("unrelated", "paper", "2026-01-01", ["Other Topic"]),
    ],
    ["Body Politics", "Bodily Autonomy"],
    {},
    30,
  );

  assert.deepEqual(selected.map((entry) => entry.cleanSlug), [
    "more-relevant",
    "newer",
  ]);
});

test("issue body repeats highlights but excludes the cover story", () => {
  const issueItems = [
    item("cover", "film", "2026-01-05"),
    item("connection-1", "book", "2026-01-04"),
    item("connection-2", "paper", "2026-01-03"),
    item("highlight", "video", "2026-01-02"),
    item("body-1", "article", "2026-01-01"),
    item("body-2", "podcast", "2025-12-31"),
  ];

  const bodyItems = getIssueBodyItems(issueItems, [issueItems[0]]);

  assert.deepEqual(bodyItems.map((entry) => entry.cleanSlug), [
    "connection-1",
    "connection-2",
    "highlight",
    "body-1",
    "body-2",
  ]);
  assert.equal(bodyItems.length, issueItems.length - 1);
});
