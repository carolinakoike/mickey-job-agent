import axios from "axios";
import type { Job } from "../matcher.js";

type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  location?: {
    name?: string;
  };
  content?: string;
  departments?: Array<{
    name: string;
  }>;
};

type GreenhouseResponse = {
  jobs: GreenhouseJob[];
};

export async function fetchGreenhouseJobs(
  companyName: string,
  boardToken: string,
): Promise<Job[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;

  const response = await axios.get<GreenhouseResponse>(url);

  return response.data.jobs.map((job) => ({
    title: job.title,
    company: companyName,
    location: job.location?.name,
    description: cleanHtml(job.content ?? ""),
    url: job.absolute_url,
    source: "Greenhouse",
  }));
}

function cleanHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
