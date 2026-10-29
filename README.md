# DoraVia

> Seu roteiro de bolso. Mascote: Dora, a gata viajante.

Guia de bolso digital para roteiros de viagem: cidades, dias, atividades, previsão do tempo, contatos de emergência e backup do banco. A interface é em português (pt-BR) e o app funciona como PWA, mantendo o roteiro acessível offline no celular.

## Funcionalidades

- Roteiro organizado por cidade, dia e atividade, com ordenação ajustável.
- Autenticação com JWT e rotas protegidas.
- Previsão do tempo por dia do roteiro usando Open-Meteo (sem API key).
- Contatos de emergência globais com links `tel:`.
- Painel administrativo para CRUD de cidades, dias, atividades e contatos.
- Importação de roteiro via CSV.
- Backup automático do SQLite (`VACUUM INTO`), com retenção dos últimos 10 arquivos.
- PWA com service worker: assets e dados da API ficam em cache para uso offline.
- Tema dark/light.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java 17 + Spring Boot 3.4 + Maven |
| Frontend | React 18 + Vite 6 + Tailwind CSS 4 |
| Banco | SQLite |
| Auth | JWT (jjwt 0.12) |
| Deploy | Docker Compose + nginx + Let's Encrypt |
| Clima | Open-Meteo |

## Estrutura

```
backend/
  src/main/java/com/doravia/
    config/       SecurityConfig, JwtUtil, JwtAuthFilter, CorsConfig, DataInitializer
    controller/   Auth, City, Day, Activity, Contact, Import, Backup
    model/        User, City, Day, Activity, Contact
    repository/   Repositórios JPA
    service/      Regras de negócio
frontend/
  src/pages/       Login, Dashboard, City, Day, Activity, Admin
  src/components/  Header, WeatherForecast, EmergencyContacts, formulários
  src/context/     AuthContext, ThemeContext
  src/api.js       Cliente HTTP da API
  public/          manifest, service worker, ícones
docker-compose.yml
deploy.sh
setup-ssl.sh
docs/
```

## Como rodar

### Docker

```bash
cp .env.example .env
# edite .env e defina um JWT_SECRET longo e aleatório
docker compose up -d --build
```

Acesse `http://localhost`.

### Desenvolvimento

Backend (porta 8080):

```bash
cd backend
SEED_USERNAME=admin SEED_PASSWORD='defina-uma-senha-forte' \
  mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Frontend (porta 5173, com proxy para `/api`):

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

O seed de desenvolvimento só cria um usuário quando `SEED_USERNAME` e `SEED_PASSWORD` estão definidos e o profile `dev` está ativo. Não há credenciais padrão.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Chave usada para assinar os tokens JWT. Use pelo menos 256 bits aleatórios. |
| `CORS_ALLOWED_ORIGINS` | Não | Origens permitidas, separadas por vírgula. Padrão: `http://localhost:5173` no backend e `http://localhost` no Docker. |
| `SEED_USERNAME` | Apenas dev | Usuário criado no primeiro start com profile `dev`. |
| `SEED_PASSWORD` | Apenas dev | Senha do usuário de seed. Sem ela, nenhum usuário é criado. |

## API

Todas as rotas exigem `Authorization: Bearer <token>`, exceto o login.

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET|POST|PUT|DELETE /api/cities`
- `GET|POST|PUT|DELETE /api/cities/{cityId}/days`
- `GET|POST|PUT|DELETE /api/days/{dayId}/activities`
- `PATCH /api/cities/reorder`
- `PATCH /api/cities/{cityId}/days/reorder`
- `PATCH /api/days/{dayId}/activities/reorder`
- `PATCH /api/activities/{id}/purchased`
- `GET|POST|PUT|DELETE /api/contacts`
- `POST /api/import/csv`
- `GET /api/backups`, `POST /api/backups`, `GET /api/backups/{filename}`

## Verificação

```bash
cd backend && mvn compile -q
cd frontend && npm run build
```

## Deploy

O repositório inclui `docker-compose.yml`, `deploy.sh` e `setup-ssl.sh` para deploy com Docker Compose, nginx e certificados Let's Encrypt. Host, domínio e credenciais devem ser configurados fora do repositório.

## Segurança

- `.env`, `data/`, certificados e backups não são versionados.
- Nunca faça commit de `data/doravia.db`, backups ou arquivos `.env`.
- Gere um `JWT_SECRET` forte e exclusivo por ambiente.
- Se um segredo for exposto, rotacione-o e recrie o histórico do Git.

## Licença

MIT. Consulte o arquivo [LICENSE](LICENSE).
