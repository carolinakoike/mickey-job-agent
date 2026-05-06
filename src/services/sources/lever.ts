import axios from "axios";
import type { Job } from "../matcher.js";

type LeverPosting = {
  text: string;
  hostedUrl: string;
  descriptionPlain?: string;
  categories?: {
    team?: string;
    department?: string;
    location?: string;
    commitment?: string;
  };
};

export async function fetchLeverJobs(
  companyName: string,
  companySlug: string,
): Promise<Job[]> {
  const url = `https://api.lever.co/v0/postings/${companySlug}?mode=json`;

  const response = await axios.get<LeverPosting[]>(url);

  return response.data.map((job) => ({
    title: job.text,
    company: companyName,
    location: job.categories?.location,
    description: [
      job.categories?.team,
      job.categories?.department,
      job.categories?.commitment,
      job.descriptionPlain,
    ]
      .filter(Boolean)
      .join(" "),
    url: job.hostedUrl,
    source: "Lever",
  }));
}
