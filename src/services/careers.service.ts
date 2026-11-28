import apiClient from "@/lib/axios";
import type { ApiResponse, JobPosting } from "@/types/ecommerce";

export interface JobApplicationPayload {
  fullName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  resumeFile?: File | null;
  coverLetter: string;
}

export const careersService = {
  async getJobs(): Promise<JobPosting[]> {
    const response = await apiClient.get<ApiResponse<JobPosting[]>>("/jobs");
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async applyJob(jobId: string, payload: JobApplicationPayload): Promise<string> {
    if (payload.resumeFile) {
      const formData = new FormData();
      formData.append("fullName", payload.fullName);
      formData.append("email", payload.email);
      formData.append("phone", payload.phone);
      formData.append("coverLetter", payload.coverLetter);
      formData.append("resume", payload.resumeFile);
      const response = await apiClient.post<ApiResponse<null>>(
        `/jobs/${encodeURIComponent(jobId)}/apply`,
        formData
      );
      return response.data.message || "Application submitted successfully";
    }

    const response = await apiClient.post<ApiResponse<null>>(
      `/jobs/${encodeURIComponent(jobId)}/apply`,
      {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        coverLetter: payload.coverLetter,
        resumeUrl: payload.resumeUrl,
      }
    );
    return response.data.message || "Application submitted successfully";
  },
};
