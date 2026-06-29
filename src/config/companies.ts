type GreenhouseCompany = {
  name: string;
  boardToken: string;
};

type LeverCompany = {
  name: string;
  companySlug: string;
};

type AshbyCompany = {
  name: string;
  companySlug: string;
};

type JobBoard = {
  name: string;
  url: string;
};

type CareerPage = {
  name: string;
  url: string;
  source: string;
};

export const greenhouseCompanies: GreenhouseCompany[] = [
  {
    name: "GitLab",
    boardToken: "gitlab",
  },
  {
    name: "MongoDB",
    boardToken: "mongodb",
  },
  {
    name: "Canonical",
    boardToken: "canonical",
  },
  {
    name: "Elastic",
    boardToken: "elastic",
  },
  {
    name: "Datadog",
    boardToken: "datadog",
  },
  {
    name: "Okta",
    boardToken: "okta",
  },
  {
    name: "Grafana Labs",
    boardToken: "grafanalabs",
  },
  {
    name: "Zenvia",
    boardToken: "zenvia",
  },
];

export const leverCompanies: LeverCompany[] = [];

export const ashbyCompanies: AshbyCompany[] = [
  {
    name: "Supabase",
    companySlug: "Supabase",
  },
  {
    name: "Railway",
    companySlug: "Railway",
  },
];

export const brazilianJobBoards: JobBoard[] = [
  {
    name: "Remotar",
    url: "https://remotar.com.br",
  },
  {
    name: "Trampos",
    url: "https://trampos.co/oportunidades",
  },
];

export const disneyJobPages: JobBoard[] = [
  {
    name: "Disney Remote",
    url: "https://www.disneycareers.com/pt-br/busca-de-vagas/remote/391/1",
  },
  {
    name: "Disney Technology",
    url: "https://empregos.disneycareers.com/%C3%A1rea/tecnologia-jobs/17190-29418/26715/1",
  },
  {
    name: "Disney Software Engineer",
    url: "https://www.disneycareers.com/en/business/job_status/software%20engineer/391/5",
  },
  {
    name: "Disney Frontend",
    url: "https://www.disneycareers.com/en/search_jobs/frontend/391/1",
  },
  {
    name: "Disney Brazil",
    url: "https://empregos.disneycareers.com/localiza%C3%A7%C3%A3o/brasil-jobs/17190/3469034/2",
  },
];

export const customCareerPages: CareerPage[] = [
  {
    name: "Tractian",
    url: "https://careers.tractian.com/jobs",
    source: "Tractian Careers",
  },
];
