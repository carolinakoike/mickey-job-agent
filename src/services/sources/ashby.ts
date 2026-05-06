import axios from "axios";
import type { Job } from "../matcher.js";

type AshbyJob = {
  title: string;
  jobUrl: string;
  locationName?: string;
  descriptionPlain?: string;
  department?: string;
  employmentType?: string;
};

type AshbyResponse = {
  jobs: AshbyJob[];
};

export async function fetchAshbyJobs(
  companyName: string,
  companySlug: string,
): Promise<Job[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${companySlug}`;

  const response = await axios.get<AshbyResponse>(url);

  return response.data.jobs.map((job) => ({
    title: job.title,
    company: companyName,
    location: job.locationName,
    description: [job.department, job.employmentType, job.descriptionPlain]
      .filter(Boolean)
      .join(" "),
    url: job.jobUrl,
    source: "Ashby",
  }));
}
