import { Router } from "express";
import { db, STAGES } from "../db.js";

export const metricsRouter = Router();

metricsRouter.get("/", (_req, res) => {
  const counts = db.prepare("SELECT stage, COUNT(*) AS total FROM candidates GROUP BY stage").all() as {
    stage: string;
    total: number;
  }[];
  const funnel = STAGES.map((stage) => ({ stage, total: counts.find((c) => c.stage === stage)?.total ?? 0 }));

  const { avgDays } = db
    .prepare(
      `SELECT ROUND(AVG(julianday(h.changed_at) - julianday(c.created_at)), 1) AS avgDays
       FROM candidates c
       JOIN stage_history h ON h.candidate_id = c.id AND h.to_stage = 'hired'`
    )
    .get() as { avgDays: number | null };

  const { openJobs } = db.prepare("SELECT COUNT(*) AS openJobs FROM jobs WHERE status = 'open'").get() as {
    openJobs: number;
  };

  const bySource = db
    .prepare(
      `SELECT source, COUNT(*) AS total,
              SUM(CASE WHEN stage = 'hired' THEN 1 ELSE 0 END) AS hired
       FROM candidates GROUP BY source ORDER BY total DESC`
    )
    .all();

  const total = funnel.reduce((s, f) => s + f.total, 0);
  const hired = funnel.find((f) => f.stage === "hired")?.total ?? 0;

  res.json({
    openJobs,
    totalCandidates: total,
    avgTimeToHireDays: avgDays,
    conversionRate: total ? Math.round((hired / total) * 1000) / 10 : 0,
    funnel,
    bySource,
  });
});
