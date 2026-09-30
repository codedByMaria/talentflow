import type { Candidate, Job, Metrics, Stage } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`Erro ${res.status} em ${url}`);
  return res.json() as Promise<T>;
}

export const api = {
  jobs: () => request<Job[]>("/api/jobs"),
  candidates: (jobId?: number) => request<Candidate[]>(`/api/candidates${jobId ? `?jobId=${jobId}` : ""}`),
  metrics: () => request<Metrics>("/api/metrics"),
  addCandidate: (data: { jobId: number; name: string; email: string; source: string }) =>
    request<Candidate>("/api/candidates", { method: "POST", body: JSON.stringify(data) }),
  moveCandidate: (id: number, stage: Stage) =>
    request<Candidate>(`/api/candidates/${id}/stage`, { method: "PATCH", body: JSON.stringify({ stage }) }),
};
