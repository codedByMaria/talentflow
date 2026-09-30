# TalentFlow — Pipeline de Recrutamento com Métricas

> Aplicação full stack para gerenciar candidatos em um funil de recrutamento (Kanban) e acompanhar indicadores como tempo médio de contratação e conversão por origem.

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![Node](https://img.shields.io/badge/Node.js-20-green) ![SQL](https://img.shields.io/badge/SQL-SQLite-lightgrey)

## Problema

Times de RH controlam candidatos em planilhas: sem histórico de etapas, sem visão do funil e sem números para decidir onde melhorar. O TalentFlow centraliza o processo e transforma o histórico de movimentações em métricas.

## Funcionalidades

- Quadro Kanban com arrastar-e-soltar entre etapas (inscritos → triagem → entrevista → proposta → contratado/reprovado)
- Atualização otimista na interface, com rollback em caso de falha na API
- Painel de métricas: vagas abertas, total de candidatos, tempo médio de contratação e taxa de conversão
- Histórico de cada mudança de etapa (auditoria) em tabela dedicada
- Validação de entrada com Zod e constraints no banco (`CHECK`, `FOREIGN KEY`)
- Dados de exemplo carregados automaticamente na primeira execução

## Stack

| Camada | Tecnologias |
| --- | --- |
| Front-end | React 18, TypeScript, Vite, CSS (tema claro/escuro) |
| Back-end | Node.js, Express, TypeScript, Zod |
| Banco | SQLite (SQL puro via better-sqlite3), pronto para migrar para PostgreSQL |

## Arquitetura

```
React (Vite)  --HTTP/JSON-->  Express API  --SQL-->  SQLite
   Kanban + métricas           rotas + Zod          jobs / candidates / stage_history
```

Decisões técnicas:
- **SQL puro em vez de ORM**: mostra domínio de consultas (JOIN, agregações, índices) e mantém o projeto simples.
- **Tabela `stage_history`**: cada movimentação é registrada, o que permite calcular tempo até a contratação direto em SQL.
- **Transações** nas operações que alteram mais de uma tabela.

## Como rodar

Pré-requisito: Node.js 20+.

```bash
# API
cd backend
npm install
npm run dev        # http://localhost:3001

# Front-end (outro terminal)
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/jobs` | Lista vagas com contagem de candidatos |
| POST | `/api/jobs` | Cria vaga |
| GET | `/api/candidates?jobId=` | Lista candidatos (filtro opcional por vaga) |
| POST | `/api/candidates` | Cadastra candidato |
| PATCH | `/api/candidates/:id/stage` | Move candidato de etapa e registra histórico |
| GET | `/api/metrics` | Funil, tempo médio de contratação, conversão e origem |

## Roadmap

- [ ] Autenticação (JWT) e perfis de acesso
- [ ] Testes automatizados (Vitest + Supertest) e CI com GitHub Actions
- [ ] Docker Compose com PostgreSQL
- [ ] Gráficos de funil e de origem dos candidatos
- [ ] Exportação de relatórios em CSV

## Autor

**Maria Eduarda Silva dos Santos** — [LinkedIn](www.linkedin.com/in/mariads-tech) · [GitHub](https://github.com/codedByMaria)
