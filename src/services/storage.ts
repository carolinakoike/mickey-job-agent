import fs from "node:fs";
import path from "node:path";
import type { MatchResult } from "./matcher.js";

const filePath = path.resolve("data", "seen-jobs.json");

export function loadSeenJobUrls(): string[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");

  if (!content.trim()) {
    return [];
  }

  return JSON.parse(content);
}

export function saveSeenJobUrls(urls: string[]) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(urls, null, 2));
}

export function filterNewResults(results: MatchResult[]) {
  const seenUrls = new Set(loadSeenJobUrls());

  const newResults = results.filter((result) => {
    return !seenUrls.has(result.job.url);
  });

  const updatedSeenUrls = new Set([
    ...seenUrls,
    ...newResults.map((result) => result.job.url),
  ]);

  saveSeenJobUrls(Array.from(updatedSeenUrls));

  return newResults;
}
