import { useState } from "react";
import { STAGES, STAGE_LABEL, type Candidate, type Stage } from "../types";

interface Props {
  candidates: Candidate[];
  onMove: (id: number, stage: Stage) => void;
}

export function KanbanBoard({ candidates, onMove }: Props) {
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const handleDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setOverStage(null);
    const id = Number(e.dataTransfer.getData("text/plain"));
    const candidate = candidates.find((c) => c.id === id);
    if (candidate && candidate.stage !== stage) onMove(id, stage);
  };

  return (
    <div className="board">
      {STAGES.map((stage) => {
        const items = candidates.filter((c) => c.stage === stage);
        return (
          <div
            key={stage}
            className={`column ${overStage === stage ? "over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage(null)}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <h3>
              {STAGE_LABEL[stage]} <span className="badge">{items.length}</span>
            </h3>
            {items.map((c) => (
              <article
                key={c.id}
                className="candidate"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(c.id))}
              >
                <strong>{c.name}</strong>
                <span>{c.email}</span>
                <small>Origem: {c.source}</small>
              </article>
            ))}
          </div>
        );
      })}
    </div>
  );
}
