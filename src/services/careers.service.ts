import apiClient from "@/lib/axios";
import type { ApiResponse, JobPosting } from "@/types/ecommerce";

export interface JobApplicationPayload {
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
}

export const careersService = {
  async getJobs(): Promise<JobPosting[]> {
    const response = await apiClient.get<ApiResponse<JobPosting[]>>("/jobs");
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async applyJob(jobId: string, payload: JobApplicationPayload): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/jobs/${encodeURIComponent(jobId)}/apply`,
      payload
    );
    return response.data.message || "Application submitted successfully";
  },
};
