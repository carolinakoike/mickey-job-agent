import type { Job } from "../matcher.js";

type RemotiveJob = {
  id: number;
  url: string;
  title: string;
  company_name: string;
  candidate_required_location?: string;
  description?: string;
  publication_date?: string;
  job_type?: string;
  category?: string;
  tags?: string[];
};

type RemotiveResponse = {
  jobs: RemotiveJob[];
};

const REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs";

export async function fetchRemotiveJobs(): Promise<Job[]> {
  const params = new URLSearchParams({
    category: "software-dev",
  });

  const response = await fetch(`${REMOTIVE_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar vagas na Remotive: ${response.status}`);
  }

  const data = (await response.json()) as RemotiveResponse;

  return data.jobs.map((job) => ({
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location ?? "Remote",
    description: stripHtml(job.description ?? ""),
    url: job.url,
    source: "Remotive",
  }));
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
