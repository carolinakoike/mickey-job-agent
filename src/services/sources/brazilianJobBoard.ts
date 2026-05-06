import { chromium } from "playwright";
import type { Job } from "../matcher.js";

type BrazilianJobBoard = {
  name: string;
  url: string;
};

type ExtractedLink = {
  title: string;
  href: string;
};

export async function fetchBrazilianJobBoardJobs(
  board: BrazilianJobBoard,
): Promise<Job[]> {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.goto(board.url, {
      waitUntil: "networkidle",
      timeout: 45000,
    });

    await page.waitForTimeout(3000);

    const links = await page.evaluate<ExtractedLink[]>(() => {
      return Array.from(document.querySelectorAll("a")).map((link) => ({
        title: (link.textContent ?? "").replace(/\s+/g, " ").trim(),
        href: (link as HTMLAnchorElement).href,
      }));
    });

    const jobs = links
      .filter((link) => link.title.length >= 8)
      .filter((link) => looksLikeJobUrl(link.href, board.name))
      .filter((link) => looksLikeUsefulTitle(link.title))
      .map<Job>((link) => ({
        title: link.title,
        company: board.name,
        location: "Brasil / Remoto",
        description: link.title,
        url: link.href,
        source: board.name,
      }));

    return dedupeJobs(jobs);
  } finally {
    await browser.close();
  }
}

function looksLikeJobUrl(url: string, sourceName: string) {
  const normalizedUrl = url.toLowerCase();
  const normalizedSource = sourceName.toLowerCase();

  if (normalizedSource === "remotar") {
    return (
      normalizedUrl.includes("remotar.com.br") &&
      (normalizedUrl.includes("/vaga") ||
        normalizedUrl.includes("/job") ||
        normalizedUrl.includes("/oportunidade"))
    );
  }

  if (normalizedSource === "trampos") {
    return (
      normalizedUrl.includes("trampos.co") &&
      (normalizedUrl.includes("/oportunidades/") ||
        normalizedUrl.includes("/job/") ||
        normalizedUrl.includes("/vagas/"))
    );
  }

  return false;
}

function looksLikeUsefulTitle(title: string) {
  const normalized = title.toLowerCase();

  const uselessWords = [
    "entrar",
    "login",
    "cadastre",
    "cadastrar",
    "menu",
    "política",
    "politica",
    "privacidade",
    "termos",
    "cookies",
    "ver mais",
    "saiba mais",
    "empresa",
    "candidatar",
    "compartilhar",
    "fale conosco",
    "blog",
    "para empresas",
  ];

  return !uselessWords.some((word) => normalized.includes(word));
}

function dedupeJobs(jobs: Job[]) {
  const map = new Map<string, Job>();

  for (const job of jobs) {
    map.set(job.url, job);
  }

  return Array.from(map.values());
}
