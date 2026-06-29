import { forbiddenKeywords, keywordWeights } from "../config/keywords.js";

export type Job = {
  title: string;
  company: string;
  location?: string | undefined;
  description?: string | undefined;
  url: string;
  source: string;
};

export type MatchResult = {
  job: Job;
  score: number;
  matchedKeywords: string[];
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const wantedTitleKeywords = [
  // Front-end
  "frontend",
  "front-end",
  "front end",
  "desenvolvedor frontend",
  "desenvolvedora frontend",
  "desenvolvedor front-end",
  "desenvolvedora front-end",
  "desenvolvedor front end",
  "desenvolvedora front end",
  "front end developer",
  "frontend developer",

  // React / JS / TS
  "react",
  "react native",
  "javascript",
  "typescript",

  // Fullstack
  "fullstack",
  "full-stack",
  "full stack",
  "desenvolvedor fullstack",
  "desenvolvedora fullstack",
  "desenvolvedor full-stack",
  "desenvolvedora full-stack",
  "full stack developer",
  "fullstack developer",

  // Backend aceitável
  "backend",
  "back-end",
  "back end",
  "node",
  "node.js",
  "java",

  // Genéricos tech
  "desenvolvedor",
  "desenvolvedora",
  "programador",
  "programadora",
  "software developer",
  "software engineer",
  "engenheiro de software",
  "engenheira de software",
  "analista desenvolvedor",
  "analista desenvolvedora",
];

export function hasForbiddenKeyword(job: Job) {
  const haystack = normalize(
    `${job.title} ${job.company} ${job.location ?? ""} ${job.description ?? ""}`,
  );

  return forbiddenKeywords.some((keyword) =>
    haystack.includes(keyword.toLowerCase()),
  );
}

export function scoreJob(job: Job) {
  const titleAndLocation = normalize(
    `${job.title} ${job.company} ${job.location ?? ""}`,
  );

  const fullText = normalize(
    `${job.title} ${job.company} ${job.location ?? ""} ${job.description ?? ""}`,
  );

  let score = 0;
  const matchedKeywords: string[] = [];

  for (const [keyword, weight] of Object.entries(keywordWeights)) {
    const normalizedKeyword = keyword.toLowerCase();

    if (titleAndLocation.includes(normalizedKeyword)) {
      score += weight;
      matchedKeywords.push(keyword);
      continue;
    }

    if (fullText.includes(normalizedKeyword)) {
      score += Math.floor(weight / 2);
      matchedKeywords.push(`${keyword} (descrição)`);
    }
  }

  if (job.company.toLowerCase().includes("disney")) {
    score += 30;
    matchedKeywords.push("disney bonus");
  }

  return {
    job,
    score,
    matchedKeywords,
  };
}

export function filterMatchingJobs(jobs: Job[]) {
  return jobs
    .filter((job) => hasWantedTitleKeyword(job))
    .filter((job) => !hasForbiddenKeyword(job))
    .filter((job) => !hasForbiddenTitleKeyword(job))
    .map(scoreJob)
    .filter((result) => {
      const isDisney = result.job.company.toLowerCase().includes("disney");
      return isDisney ? result.score >= 0 : result.score >= 20;
    })
    .sort((a, b) => {
      const aDisney = a.job.company.toLowerCase().includes("disney");
      const bDisney = b.job.company.toLowerCase().includes("disney");

      if (aDisney && !bDisney) return -1;
      if (!aDisney && bDisney) return 1;

      return b.score - a.score;
    });
}

const forbiddenTitleKeywords = [
  "staff",
  "principal",
  "director",
  "head of",
  "vp ",
  "vice president",
  "sales",
  "marketing",
  "designer",
  "product manager",
  "internship",
  "estágio",
  "estagio",
  "freelance",
  "freelancer",
  "freela",
  "freela",
  "freelancer",
  "consultor(a) de outplacement",
  "outplacement",
  "customer success manager",
  "atendimento publicitário",
  "recursos humanos",
  "gestor(a) de tráfego",
  "gestor de tráfego",
  "design",
  "designer",
  "produtor(a)",
  "produtor",
  "inspetor(a)",
  "inspetor",
  "sdr",
  "sales development representative",
  "qualidade",
  "publicidade",
  "tráfego",
  "trafego",
  "senior",
  "sr.",
  "sr ",
  "sênior",
  "php",
  ".net",
  "segurança",
  "security",
  "advogado ",
  "advogada ",
  "advogado(a) ",
  "vendedor(a) ",
  "vendedor ",
  "vendedora ",
  "marketing",
  "promotor de vendas",
  "vendas",
  "consultor comercial",
  "consultora comercial",
  "consultor(a) comercial",
  "representante comercial",
  "representante de vendas",
  "representante comercial",
  "representante de vendas",
  "analista de marketing",
  "analista de vendas",
  "analista comercial",
  "analista de tráfego",
  "analista de marketing digital",
  "analista de mídias sociais",
  "social media",
  "analista de conteúdo",
  "analista de comunicação",
  "analista de relacionamento",
  "analista de atendimento",
  "analista de suporte",
  "suporte técnico",
  "customer support",
  "atendimento",
];

function hasForbiddenTitleKeyword(job: Job) {
  const title = normalize(job.title);

  return forbiddenTitleKeywords.some((keyword) =>
    title.includes(keyword.toLowerCase()),
  );
}

function hasWantedTitleKeyword(job: Job) {
  const title = normalize(job.title);

  return wantedTitleKeywords.some((keyword) =>
    title.includes(normalize(keyword)),
  );
}
