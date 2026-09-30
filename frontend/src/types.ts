export const STAGES = ["applied", "screening", "interview", "offer", "hired", "rejected"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  applied: "Inscritos",
  screening: "Triagem",
  interview: "Entrevista",
  offer: "Proposta",
  hired: "Contratados",
  rejected: "Reprovados",
};

export interface Job {
  id: number;
  title: string;
  department: string;
  status: "open" | "closed";
  candidates: number;
}

export interface Candidate {
  id: number;
  jobId: number;
  name: string;
  email: string;
  source: string;
  stage: Stage;
  createdAt: string;
}

export interface Metrics {
  openJobs: number;
  totalCandidates: number;
  avgTimeToHireDays: number | null;
  conversionRate: number;
  funnel: { stage: Stage; total: number }[];
  bySource: { source: string; total: number; hired: number }[];
}
