# Rodar o DoraVia localmente

Guia para subir o projeto na sua máquina. O banco SQLite fica em `data/` e não é versionado.

## Pré-requisitos

- Java 17 + Maven
- Node.js 20+ / npm
- Docker + Docker Compose (opcional)

## 1. Subir com Docker (recomendado)

```bash
cp .env.example .env
# edite o .env e defina um JWT_SECRET longo e aleatório
docker compose up -d --build
```

Acesse http://localhost.

## 2. Subir em modo dev

Backend (terminal 1):

```bash
cd backend
SEED_USERNAME=admin SEED_PASSWORD='defina-uma-senha-forte' \
  mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Frontend (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173 (o Vite faz proxy de `/api` para a porta 8080).

## Observações

- O `DataInitializer` roda apenas com o profile `dev` e só cria um usuário quando `SEED_USERNAME` e `SEED_PASSWORD` estão definidos. Não há credenciais padrão.
- Com banco vazio e sem seed, crie o usuário pelo seed de desenvolvimento ou insira-o manualmente no SQLite.
- O banco e os backups contêm dados pessoais — **não** comite `data/` nem arquivos `.db`.
- Para gerar um novo backup: Admin → "Fazer Backup" (ou `POST /api/backups`).
