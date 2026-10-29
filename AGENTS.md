# AGENTS.md — Guia Rápido para Agentes

Contexto essencial para trabalhar no **DoraVia** sem explorar o repositório inteiro. A UI é em **português (pt-BR)**.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java 17 + Spring Boot 3.4.1 + Maven |
| Frontend | React 18 + Vite 6 + Tailwind CSS 4 |
| Banco | SQLite (`data/doravia.db`, arquivo único, sem credenciais) |
| Auth | JWT (jjwt 0.12.6), stateless, Bearer header |
| Deploy | Docker Compose + nginx + Let's Encrypt |
| PWA | manifest + service worker (offline no celular) |
| Clima | Open-Meteo (gratuita, **sem API key**) |

## Comandos (dev local)

```bash
# Backend (porta 8080) — usa ~/.m2, roda na máquina
cd backend && mvn spring-boot:run

# Frontend dev server (porta 5173, proxy /api → 8080)
cd frontend && npm run dev

# Builds de verificação
cd backend && mvn compile -q        # Java: sem output = OK
cd frontend && npm run build        # Vite: "✓ built" = OK

# Docker local (para testes em container)
docker compose up -d --build        # sem --profile tunnel (não usa cloudflared)
```

**Backend não tem `mvnw`** — use `mvn` do sistema.

## Estrutura

```
├── backend/src/main/java/com/doravia/
│   ├── model/      User, City, Day, Activity, Contact
│   ├── controller/ Auth, City, Day, Activity, Import, Contact, Backup
│   ├── service/    Auth, City, Day, Activity, Contact, Backup, UserDetails
│   ├── dto/        LoginRequest/Response, CityDTO, DayDTO, ActivityDTO, ContactDTO
│   ├── repository/ User, City, Day, Activity, Contact
│   └── config/     SecurityConfig, JwtUtil, JwtAuthFilter, CorsConfig,
│                   DataInitializer (dev), SchedulerConfig (@EnableScheduling)
├── frontend/
│   ├── src/pages/        Login, Dashboard, City, Day, Activity, Admin, AdminActivity
│   ├── src/components/   Header, ProtectedRoute, ActivityModal, WeatherForecast,
│   │                     EmergencyContacts, AdminCity/Day/Activity/ContactForm
│   ├── src/context/      AuthContext, ThemeContext
│   ├── src/api.js        axios instance (baseURL /api) + todas as funções de API
│   ├── src/sw-register.js  registro do service worker (PWA)
│   └── public/           manifest.json, sw.js, icon-*.png, logo.*
├── docker-compose.yml    backend + frontend (+ cloudflared em profile "tunnel")
├── deploy.sh             deploy para a VPS (build local → docker save/load)
└── data/                 doravia.db + backups/ (volume Docker)
```

## Modelo de dados (diferenças vs docs antigas)

- **Day** tem `date` (LocalDate) e `sunset` (String, ex `"19:45"`) além de `label` (`"26 (quarta)"`) e `displayOrder`.
- **Contact**: `id, name, phone, relation, displayOrder` — contatos de emergência globais.
- **City**: apenas `id, name, displayOrder`. **NÃO tem** sunset (sunset é por dia).
- Tabela criada por `ddl-auto=update` (schema não versionado; adicionar campo exige apenas reiniciar backend).

## Endpoints principais

- `POST /api/auth/login` — retorna `{ token }`
- `GET /api/cities`, `GET /api/cities/{id}` (com days+activities)
- `GET /api/days/{id}` — dia com `date`, `sunset`, `cityName`
- `GET /api/days/{dayId}/activities`
- CRUD `/api/contacts`; `GET /api/backups`, `POST /api/backups`, `GET /api/backups/{filename}`
- Reorder: `PATCH /api/cities/reorder`, `/api/cities/{cityId}/days/reorder`, `/api/days/{dayId}/activities/reorder`
- Toggle: `PATCH /api/activities/{id}/purchased`
- Import: `POST /api/import/csv` (multipart, max 10MB)

Tudo é autenticado exceto `/api/auth/login`. Envie `Authorization: Bearer <token>`.

## Convenções / regras

- **NÃO adicionar comentários no código** salvo se estritamente necessário.
- UI em pt-BR; use `lucide-react` para ícones e `react-hot-toast` para feedback.
- Tema dark/light via CSS variables em `frontend/src/index.css` (`:root` dark, `.light` italiano/creme). Tokens Tailwind: `bg-page`, `bg-card`, `bg-elevated`, `bg-card-hover`, `text-primary`, `text-body`, `text-secondary`, `text-muted`, `border-custom`, `border-custom-light`.
- Loading state com spinner em todas as telas que fazem requisição.
- Cidades/dias/atividades ordenados por `displayOrder`.
- PWA: ao mudar `public/sw.js`, **bump a versão** de `CACHE_NAME` (ex `doravia-v1` → `doravia-v2`) para invalidar cache dos celulares.

## Funcionalidades atuais (importantes)

- **Previsão do tempo** (`WeatherForecast.jsx`): usa Open-Meteo (geocoding + forecast, sem key). Mostra previsão por dia do roteiro (baseado em `Day.date`). Se hoje não corresponde a nenhum dia, mostra o primeiro destino. Não funciona offline (requer internet).
- **Contatos de emergência** (`EmergencyContacts.jsx`): card no fim do Dashboard, agrupados em emergência/família, links `tel:`.
- **Backup SQLite** (`BackupService`): `VACUUM INTO` para `data/backups/`, mantém últimos 10. Dispara em `docker compose down`, a cada 6h (`@Scheduled`) e via botão no admin.
- **PWA**: instalar no celular requer HTTPS (funciona em produção via domínio).

## Seed de desenvolvimento

O `DataInitializer` roda apenas com `@Profile("dev")` e só cria usuários quando `SEED_USERNAME` e `SEED_PASSWORD` estão definidos no ambiente. Não há credenciais padrão versionadas.

```bash
SEED_USERNAME=admin SEED_PASSWORD='defina-uma-senha-forte' mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

> Documentos internos de operação não fazem parte deste repositório público.

## Deploy / Produção

- Docker Compose + nginx + Let's Encrypt. Host, domínio e credenciais são configurados fora do repositório.
- Em VPS de pouca RAM, **não** rode `docker compose up -d --build` no servidor — o build Maven pode esgotar a memória. Build as imagens localmente, transfira com `docker save`/`load` e suba com `image:` (sem `--build`). Fluxo completo no `deploy.sh`.
- O frontend monta `./certs:/etc/nginx/certs:ro` (certs do Let's Encrypt). Se o container subir com erro "cannot load certificate", verifique o volume e se `docker-compose.yml` está atualizado.
- Banco em `data/doravia.db`; backups em `data/backups/`.
- Para reemitir/renovar SSL: `setup-ssl.sh` (certbot standalone — pare o frontend antes, libera porta 80).

## Workflows comuns

### Atualizar deploy (mudanças de código)

```bash
./deploy.sh   # builda local, docker save/load, sobe containers na VPS
```

O `deploy.sh` já cobre: build local das 2 imagens → tar → scp → `docker load` → `docker compose up -d`. Não usa `--build` na VPS (nunca!).

### Regenerar ícones da PWA (após trocar `frontend/public/logo.*`)

Sem ImageMagick/ffmpeg. Use Node + jimp (puro JS) — **jimp v1 aceita `{ w, h }`**:

```js
// instalar: npm install jimp (pasta temporária)
const { Jimp } = require('jimp');
const img = await Jimp.read('frontend/public/logo.jpeg');
const side = Math.min(img.width, img.height);
img.crop({ x: Math.floor((img.width - side) / 2), y: Math.floor((img.height - side) / 2), w: side, h: side });
for (const size of [192, 512]) {
  await img.clone().resize({ w: size, h: size }).write(`frontend/public/icon-${size}.png`);
}
```

Depois rebuilda o frontend (`docker build -t doravia-frontend:latest ./frontend`) e `./deploy.sh`.

### Renovar SSL / reemitir cert

`setup-ssl.sh` no servidor (certbot standalone). Requer parar o frontend antes (libera porta 80) e DNS apontando para a VPS.

## Como funciona o offline (PWA)

- Service worker (`public/sw.js`): intercepta só requests **mesmo domínio** (evita quebrar fotos externas e clima). Assets = cache-first; `/api/*` GET = network-first com fallback de cache.
- O **DashboardPage faz preload** de `getDay()` + `getActivities()` para TODOS os dias ao abrir com internet — é isso que torna os dias acessíveis offline. Nova página que busca dados deve receber o mesmo tratamento (ou os dados não estarão em cache).
- Limitações offline: previsão do tempo e toggle "comprado" não funcionam (requerem internet). Navegação e contatos funcionam.
- Ao alterar `public/sw.js`, **bump `CACHE_NAME`** (ex `doravia-v1` → `doravia-v2`) para forçar atualização nos celulares.

## Gotchas

- Backend com `spring.jpa.open-in-view=false` → acessar lazy (`day.getCity().getName()`) fora de transação lança exceção. Use serviço `@Transactional` (ex: `findByIdWithCity`) ou carregue antes.
- Upload `multipart` limitado a 10MB.
- Backend bind `127.0.0.1:8080` no compose (só nginx acessa).
- `DataInitializer` roda só com `@Profile("dev")` e exige `SEED_PASSWORD`.
- `GET /api/days/{id}` exige `findByIdWithCity` (transacional) por causa do lazy de `city`.
- Após deploy, confirme `curl http://localhost:80` → 200 e login → 200.
