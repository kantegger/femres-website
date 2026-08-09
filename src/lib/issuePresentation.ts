/**
 * Issue definitions are stored newest first for display, while issue numbers
 * increase chronologically.
 */
export function getIssueNumber(displayIndex: number, issueCount: number): number {
  return issueCount - displayIndex;
}
