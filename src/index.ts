import { filterMatchingJobs } from "./services/matcher.js";
import { fetchAshbyJobs } from "./services/sources/ashby.js";
import { fetchGreenhouseJobs } from "./services/sources/greenhouse.js";
import { fetchLeverJobs } from "./services/sources/lever.js";
import { sendLongTelegramMessage } from "./services/telegramService.js";
import type { Job } from "./services/matcher.js";
import { filterNewResults } from "./services/storage.js";
import { fetchBrazilianJobBoardJobs } from "./services/sources/brazilianJobBoard.js";
import {
  ashbyCompanies,
  brazilianJobBoards,
  customCareerPages,
  disneyJobPages,
  greenhouseCompanies,
  leverCompanies,
} from "./config/companies.js";

import { fetchCustomCareerPageJobs } from "./services/sources/customCareerPage.js";
import { fetchDisneyJobs } from "./services/sources/disney.js";
import { fetchRemotiveJobs } from "./services/sources/remotive.js";

function buildTelegramMessage(results: ReturnType<typeof filterMatchingJobs>) {
  if (results.length === 0) {
    return "🐭 Mickey Hunter passou por aqui: nenhuma vaga nova compatível encontrada hoje.";
  }

  return [
    "🐭 <b>Mickey Hunter encontrou vagas compatíveis:</b>",
    "",
    ...results.map((result, index) => {
      const { job, score, matchedKeywords } = result;

      return [
        `${index + 1}. <b>${escapeHtml(job.title)}</b>`,
        `Empresa: ${escapeHtml(job.company)}`,
        `Fonte: ${escapeHtml(job.source)}`,
        job.location ? `Local: ${escapeHtml(job.location)}` : undefined,
        `Score: ${score}`,
        `Match: ${escapeHtml(matchedKeywords.join(", "))}`,
        job.url,
      ]
        .filter(Boolean)
        .join("\n");
    }),
  ].join("\n\n");
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function main() {
  console.log("Buscando vagas...");

  const allJobs: Job[] = [];

  for (const company of greenhouseCompanies) {
    console.log(`Buscando Greenhouse: ${company.name}...`);

    try {
      const jobs = await fetchGreenhouseJobs(company.name, company.boardToken);
      allJobs.push(...jobs);
      console.log(`${company.name}: ${jobs.length} vagas encontradas.`);
    } catch (error) {
      console.error(`Erro ao buscar Greenhouse ${company.name}:`, error);
    }
  }

  for (const company of leverCompanies) {
    console.log(`Buscando Lever: ${company.name}...`);

    try {
      const jobs = await fetchLeverJobs(company.name, company.companySlug);
      allJobs.push(...jobs);
      console.log(`${company.name}: ${jobs.length} vagas encontradas.`);
    } catch (error) {
      console.error(`Erro ao buscar Lever ${company.name}:`, error);
    }
  }

  for (const company of ashbyCompanies) {
    console.log(`Buscando Ashby: ${company.name}...`);

    try {
      const jobs = await fetchAshbyJobs(company.name, company.companySlug);
      allJobs.push(...jobs);
      console.log(`${company.name}: ${jobs.length} vagas encontradas.`);
    } catch (error) {
      console.error(`Erro ao buscar Ashby ${company.name}:`, error);
    }
  }

  for (const board of brazilianJobBoards) {
    console.log(`Buscando ${board.name}...`);
    try {
      const jobs = await fetchBrazilianJobBoardJobs(board);
      allJobs.push(...jobs);
      console.log(`${board.name}: ${jobs.length} vagas encontradas.`);
    } catch (error) {
      console.error(`Erro ao buscar ${board.name}:`, error);
    }
  }

  console.log("Buscando Remotive...");

  try {
    const remotiveJobs = await fetchRemotiveJobs();
    allJobs.push(...remotiveJobs);
    console.log(`Remotive: ${remotiveJobs.length} vagas encontradas.`);
  } catch (error) {
    console.error("Erro ao buscar Remotive:", error);
  }
  console.log("Buscando Disney Careers...");

  try {
    const disneyJobs = await fetchDisneyJobs(disneyJobPages);
    allJobs.push(...disneyJobs);
    console.log(`Disney Careers: ${disneyJobs.length} vagas encontradas.`);
  } catch (error) {
    console.error("Erro ao buscar Disney Careers:", error);
  }

  for (const careerPage of customCareerPages) {
    console.log(
      `Buscando página própria: ${careerPage.name} - ${careerPage.url}...`,
    );

    try {
      const jobs = await fetchCustomCareerPageJobs(careerPage);
      allJobs.push(...jobs);
      console.log(`${careerPage.name}: ${jobs.length} vagas encontradas.`);
    } catch (error) {
      console.error(`Erro ao buscar ${careerPage.name}:`, error);
    }
  }

  function dedupeJobsByUrl(jobs: Job[]) {
    const map = new Map<string, Job>();

    for (const job of jobs) {
      map.set(job.url, job);
    }

    return Array.from(map.values());
  }

  console.log(`Total bruto: ${allJobs.length} vagas.`);

  const uniqueJobs = dedupeJobsByUrl(allJobs);

  console.log(`Total único: ${uniqueJobs.length} vagas.`);

  const results = filterMatchingJobs(uniqueJobs);

  console.log(`Total compatível: ${results.length} vagas.`);

  const newResults = filterNewResults(results);

  console.log(`Total novo: ${newResults.length} vagas.`);

  const message = buildTelegramMessage(newResults);

  await sendLongTelegramMessage(message);

  console.log("Vagas filtradas e enviadas com sucesso.");
}
main().catch((error) => {
  console.error("Erro ao executar o Mickey Hunter:", error);
});
