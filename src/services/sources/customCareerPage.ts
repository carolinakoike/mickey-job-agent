import { chromium } from "playwright";
import type { Job } from "../matcher.js";

type CustomCareerPage = {
  name: string;
  url: string;
  source: string;
};

type ExtractedLink = {
  title: string;
  href: string;
  nearbyText: string;
};

export async function fetchCustomCareerPageJobs(
  careerPage: CustomCareerPage,
): Promise<Job[]> {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.goto(careerPage.url, {
      waitUntil: "networkidle",
      timeout: 45000,
    });

    await page.waitForTimeout(2500);

    const links = await page.evaluate<ExtractedLink[]>(() => {
      return Array.from(document.querySelectorAll("a")).map((link) => {
        const anchor = link as HTMLAnchorElement;

        return {
          title: (anchor.textContent ?? "").replace(/\s+/g, " ").trim(),
          href: anchor.href,
          nearbyText:
            anchor.parentElement?.textContent?.replace(/\s+/g, " ").trim() ??
            "",
        };
      });
    });

    const jobs = links
      .filter((link) => link.title.length >= 8)
      .filter((link) => looksLikeJobUrl(link.href, careerPage.name))
      .filter((link) => looksLikeUsefulTitle(link.title))
      .map<Job>((link) => ({
        title: link.title,
        company: careerPage.name,
        location: extractLocationFromText(link.nearbyText),
        description: link.nearbyText || link.title,
        url: link.href,
        source: careerPage.source,
      }));

    return dedupeJobs(jobs);
  } finally {
    await browser.close();
  }
}

function looksLikeJobUrl(url: string, companyName: string) {
  const normalizedUrl = url.toLowerCase();
  const normalizedCompany = companyName.toLowerCase();

  if (normalizedCompany.includes("tractian")) {
    return (
      normalizedUrl.includes("careers.tractian.com") &&
      normalizedUrl.includes("/jobs/")
    );
  }

  return false;
}

function looksLikeUsefulTitle(title: string) {
  const normalized = title.toLowerCase();

  const uselessWords = [
    "job openings",
    "go to market",
    "engineering blueprint",
    "about our teams",
    "join the team",
    "privacy",
    "terms",
    "cookies",
    "about",
    "home",
  ];

  return !uselessWords.some((word) => normalized.includes(word));
}

function extractLocationFromText(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();

  if (!cleaned) return undefined;

  return cleaned.slice(0, 180);
}

function dedupeJobs(jobs: Job[]) {
  const map = new Map<string, Job>();

  for (const job of jobs) {
    map.set(job.url, job);
  }

  return Array.from(map.values());
}
//@ts-check
