import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { KanbanBoard } from "./components/KanbanBoard";
import { MetricsCards } from "./components/MetricsCards";
import type { Candidate, Job, Metrics, Stage } from "./types";

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState<number | undefined>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", source: "linkedin" });

  const refresh = useCallback(async () => {
    try {
      const [j, c, m] = await Promise.all([api.jobs(), api.candidates(jobId), api.metrics()]);
      setJobs(j);
      setCandidates(c);
      setMetrics(m);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    }
  }, [jobId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleMove = async (id: number, stage: Stage) => {
    // Atualização otimista: a UI responde na hora, a API confirma depois
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
    try {
      await api.moveCandidate(id, stage);
      setMetrics(await api.metrics());
    } catch {
      void refresh(); // reverte para o estado real do servidor
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = jobId ?? jobs[0]?.id;
    if (!target) return;
    await api.addCandidate({ jobId: target, ...form });
    setForm({ ...form, name: "", email: "" });
    void refresh();
  };

  return (
    <main className="container">
      <header className="header">
        <h1>TalentFlow</h1>
        <select value={jobId ?? ""} onChange={(e) => setJobId(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">Todas as vagas</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} ({j.candidates})
            </option>
          ))}
        </select>
      </header>

      {error && <p className="error">{error}</p>}
      {metrics && <MetricsCards metrics={metrics} />}

      <form className="add-form" onSubmit={handleAdd}>
        <input required placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
          <option value="linkedin">LinkedIn</option>
          <option value="indicação">Indicação</option>
          <option value="site">Site</option>
        </select>
        <button type="submit">Adicionar candidato</button>
      </form>

      <KanbanBoard candidates={candidates} onMove={handleMove} />
    </main>
  );
}
