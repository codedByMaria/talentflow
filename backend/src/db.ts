import Database from "better-sqlite3";

export const STAGES = ["applied", "screening", "interview", "offer", "hired", "rejected"] as const;
export type Stage = (typeof STAGES)[number];

export const db = new Database(process.env.DB_PATH ?? "talentflow.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    department TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id     INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    source     TEXT NOT NULL DEFAULT 'other',
    stage      TEXT NOT NULL DEFAULT 'applied'
               CHECK (stage IN ('applied','screening','interview','offer','hired','rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stage_history (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    from_stage   TEXT,
    to_stage     TEXT NOT NULL,
    changed_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_candidates_job ON candidates(job_id);
  CREATE INDEX IF NOT EXISTS idx_history_candidate ON stage_history(candidate_id);
`);

export function seedIfEmpty(): void {
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM jobs").get() as { n: number };
  if (n > 0) return;

  const insertJob = db.prepare("INSERT INTO jobs (title, department) VALUES (?, ?)");
  const insertCand = db.prepare(
    "INSERT INTO candidates (job_id, name, email, source, stage, created_at) VALUES (?, ?, ?, ?, ?, datetime('now', ?))"
  );
  const insertHist = db.prepare(
    "INSERT INTO stage_history (candidate_id, from_stage, to_stage, changed_at) VALUES (?, ?, ?, datetime('now', ?))"
  );

  db.transaction(() => {
    const j1 = insertJob.run("Desenvolvedor Full Stack", "Tecnologia").lastInsertRowid as number;
    const j2 = insertJob.run("Analista de Dados", "Operações").lastInsertRowid as number;
    const people: [number, string, string, string, Stage, string][] = [
      [j1, "Ana Souza", "ana@example.com", "linkedin", "interview", "-12 days"],
      [j1, "Bruno Lima", "bruno@example.com", "indicação", "screening", "-8 days"],
      [j1, "Carla Dias", "carla@example.com", "site", "applied", "-2 days"],
      [j1, "Diego Reis", "diego@example.com", "linkedin", "hired", "-30 days"],
      [j2, "Elisa Moraes", "elisa@example.com", "indicação", "offer", "-15 days"],
      [j2, "Fábio Nunes", "fabio@example.com", "site", "rejected", "-20 days"],
      [j2, "Gabi Torres", "gabi@example.com", "linkedin", "applied", "-1 days"],
    ];
    for (const [job, name, email, source, stage, age] of people) {
      const id = insertCand.run(job, name, email, source, stage, age).lastInsertRowid as number;
      insertHist.run(id, null, "applied", age);
      if (stage === "hired") insertHist.run(id, "offer", "hired", "-10 days");
    }
  })();
}
