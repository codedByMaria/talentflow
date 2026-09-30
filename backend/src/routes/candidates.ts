import { Router } from "express";
import { db } from "../db.js";
import { candidateSchema, stageSchema } from "../schemas.js";

export const candidatesRouter = Router();

const SELECT = `SELECT id, job_id AS jobId, name, email, source, stage, created_at AS createdAt FROM candidates`;

candidatesRouter.get("/", (req, res) => {
  const jobId = Number(req.query.jobId);
  const rows = Number.isInteger(jobId) && jobId > 0
    ? db.prepare(`${SELECT} WHERE job_id = ? ORDER BY created_at DESC`).all(jobId)
    : db.prepare(`${SELECT} ORDER BY created_at DESC`).all();
  res.json(rows);
});

candidatesRouter.post("/", (req, res) => {
  const parsed = candidateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { jobId, name, email, source } = parsed.data;

  const job = db.prepare("SELECT id FROM jobs WHERE id = ?").get(jobId);
  if (!job) return res.status(404).json({ error: "Vaga não encontrada" });

  const created = db.transaction(() => {
    const id = db
      .prepare("INSERT INTO candidates (job_id, name, email, source) VALUES (?, ?, ?, ?)")
      .run(jobId, name, email, source).lastInsertRowid;
    db.prepare("INSERT INTO stage_history (candidate_id, from_stage, to_stage) VALUES (?, NULL, 'applied')").run(id);
    return db.prepare(`${SELECT} WHERE id = ?`).get(id);
  })();
  res.status(201).json(created);
});

candidatesRouter.patch("/:id/stage", (req, res) => {
  const parsed = stageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const id = Number(req.params.id);
  const current = db.prepare("SELECT stage FROM candidates WHERE id = ?").get(id) as { stage: string } | undefined;
  if (!current) return res.status(404).json({ error: "Candidato não encontrado" });
  if (current.stage === parsed.data.stage) return res.json(db.prepare(`${SELECT} WHERE id = ?`).get(id));

  const updated = db.transaction(() => {
    db.prepare("UPDATE candidates SET stage = ? WHERE id = ?").run(parsed.data.stage, id);
    db.prepare("INSERT INTO stage_history (candidate_id, from_stage, to_stage) VALUES (?, ?, ?)")
      .run(id, current.stage, parsed.data.stage);
    return db.prepare(`${SELECT} WHERE id = ?`).get(id);
  })();
  res.json(updated);
});
