import assert from "node:assert/strict";
import test from "node:test";
import { getIssueNumber } from "../src/lib/issuePresentation";

test("issue numbers descend when definitions are displayed newest first", () => {
  assert.deepEqual(
    Array.from({ length: 4 }, (_, index) => getIssueNumber(index, 4)),
    [4, 3, 2, 1],
  );
});
