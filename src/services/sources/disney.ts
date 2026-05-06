import { chromium } from "playwright";
import type { Job } from "../matcher.js";

type DisneyJobPage = {
  name: string;
  url: string;
};

type ExtractedLink = {
  title: string;
  href: string;
  nearbyText: string;
};

export async function fetchDisneyJobs(pages: DisneyJobPage[]): Promise<Job[]> {
  const browser = await chromium.launch({
    headless: true,
  });

  const allJobs: Job[] = [];

  try {
    const page = await browser.newPage();

    for (const disneyPage of pages) {
      console.log(`Buscando Disney: ${disneyPage.name}...`);

      await page.goto(disneyPage.url, {
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
        .filter((link) => link.title.length >= 6)
        .filter((link) => looksLikeDisneyJobUrl(link.href))
        .filter((link) => looksLikeUsefulDisneyTitle(link.title))
        .map<Job>((link) => ({
          title: link.title,
          company: "Disney",
          location: extractLocationFromText(link.nearbyText),
          description: link.nearbyText,
          url: link.href,
          source: disneyPage.name,
        }));

      console.log(`${disneyPage.name}: ${jobs.length} vagas encontradas.`);
      allJobs.push(...jobs);
    }

    return dedupeJobs(allJobs);
  } finally {
    await browser.close();
  }
}

function looksLikeDisneyJobUrl(url: string) {
  const normalizedUrl = url.toLowerCase();

  return (
    normalizedUrl.includes("disneycareers.com") &&
    (normalizedUrl.includes("/job/") ||
      normalizedUrl.includes("/trabalho/") ||
      normalizedUrl.includes("/jobs/"))
  );
}

function looksLikeUsefulDisneyTitle(title: string) {
  const normalized = title.toLowerCase();

  const uselessWords = [
    "save job",
    "salvar vaga",
    "view all",
    "ver todas",
    "candidate resources",
    "life at disney",
    "privacy",
    "terms",
    "cookies",
    "search",
    "buscar",
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
