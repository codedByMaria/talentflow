import { Router } from "express";
import { db } from "../db.js";
import { jobSchema } from "../schemas.js";

export const jobsRouter = Router();

jobsRouter.get("/", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT j.id, j.title, j.department, j.status, j.created_at AS createdAt,
              COUNT(c.id) AS candidates
       FROM jobs j LEFT JOIN candidates c ON c.job_id = j.id
       GROUP BY j.id ORDER BY j.created_at DESC`
    )
    .all();
  res.json(rows);
});

jobsRouter.post("/", (req, res) => {
  const parsed = jobSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { title, department } = parsed.data;
  const info = db.prepare("INSERT INTO jobs (title, department) VALUES (?, ?)").run(title, department);
  res.status(201).json({ id: info.lastInsertRowid, title, department, status: "open" });
});
