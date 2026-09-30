import { z } from "zod";
import { STAGES } from "./db.js";

export const jobSchema = z.object({
  title: z.string().min(2).max(120),
  department: z.string().min(2).max(80),
});

export const candidateSchema = z.object({
  jobId: z.number().int().positive(),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  source: z.string().min(2).max(40).default("other"),
});

export const stageSchema = z.object({ stage: z.enum(STAGES) });
