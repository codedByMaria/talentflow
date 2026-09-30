import type { Metrics } from "../types";

export function MetricsCards({ metrics }: { metrics: Metrics }) {
  const cards = [
    { label: "Vagas abertas", value: metrics.openJobs },
    { label: "Candidatos", value: metrics.totalCandidates },
    {
      label: "Tempo médio de contratação",
      value: metrics.avgTimeToHireDays !== null ? `${metrics.avgTimeToHireDays} dias` : "—",
    },
    { label: "Taxa de conversão", value: `${metrics.conversionRate}%` },
  ];

  return (
    <section className="cards" aria-label="Indicadores">
      {cards.map((c) => (
        <div className="card" key={c.label}>
          <span className="card-label">{c.label}</span>
          <strong className="card-value">{c.value}</strong>
        </div>
      ))}
    </section>
  );
}
