# Especificação Técnica — DoraVia (Guia de Bolso)

## 1. Visão Geral

Site privado para consulta e administração do roteiro detalhado de viagem à Europa (21/08 a 05/09). Funciona como um "guia de bolso" digital com todo o cronograma, atrações, ingressos, valores, horários e curiosidades. Totalmente privado: autenticação obrigatória para qualquer acesso.

Os dados são povoados **uma única vez** a partir do CSV existente ("cronograma - Detalhado.csv"). Após essa importação inicial, o site passa a ser a fonte única da verdade — todo e qualquer update é feito exclusivamente via dashboard administrativa.

**Stack:** Java 17 + Spring Boot 3 (backend) | React 18 + Vite (frontend) | SQLite (banco) | Docker (deploy)

---

## 2. Modelo de Dados (SQLite)

### 2.1 Estrutura do Banco

```sql
-- Tabela de usuários do app
CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,          -- bcrypt hash
    display_name TEXT   NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Tabela de cidades
CREATE TABLE cities (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,        -- ex: "Roma", "Florença"
    display_order INTEGER NOT NULL DEFAULT 0
);

-- Tabela de dias (cada dia de viagem dentro de uma cidade)
CREATE TABLE days (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id       INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    label         TEXT    NOT NULL,        -- ex: "22 (sábado)", "26 (quarta)"
    display_order INTEGER NOT NULL DEFAULT 0
);

-- Tabela de atividades (cada evento/passeio do dia)
CREATE TABLE activities (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id         INTEGER NOT NULL REFERENCES days(id) ON DELETE CASCADE,
    time_slot      TEXT,                   -- ex: "06h50–08h30"
    title          TEXT    NOT NULL,        -- ex: "Panteão", "Coliseu e Fórum Romano"
    description    TEXT,                   -- observações detalhadas
    price          TEXT,                   -- ex: "€24,00"
    purchased      INTEGER NOT NULL DEFAULT 0,  -- 0 = FALSE, 1 = TRUE
    opening_hours  TEXT,                   -- horários de funcionamento
    transport      TEXT,                   -- ex: "A pé - 8 min", "Carro - 15 min"
    map_link       TEXT,                   -- link do Google Maps
    photo_url      TEXT,                   -- URL da foto
    curiosity      TEXT,                   -- curiosidades/texto longo
    display_order  INTEGER NOT NULL DEFAULT 0
);

-- Índices
CREATE INDEX idx_days_city_id ON days(city_id);
CREATE INDEX idx_activities_day_id ON activities(day_id);
CREATE INDEX idx_activities_display_order ON activities(day_id, display_order);
```

### 2.2 Seed inicial
Os 2 usuários são pré-cadastrados via `DataInitializer` na primeira execução.

Cidades, dias e atividades são povoados **uma única vez** via importação do CSV ("cronograma - Detalhado.csv") em um endpoint dedicado (`POST /api/import/csv`). Esse endpoint lê o CSV, agrupa por cidade e dia, e insere tudo no banco respeitando a ordem. Após a importação, o CSV é descartado — todoas as alterações passam a ser feitas exclusivamente pela dashboard admin.

---

## 3. Backend (Java / Spring Boot)

### 3.1 Dependências (Maven)

- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `io.jsonwebtoken:jjwt-api / jjwt-impl / jjwt-jackson` (ou `nimbus-jose-jwt`)
- `org.xerial:sqlite-jdbc`
- `org.hibernate.orm:hibernate-community-dialects` (dialeto SQLite)
- `org.springframework.boot:spring-boot-starter-test` (scope test)

### 3.2 Autenticação

- **Tipo:** JWT (JSON Web Token)
- **Fluxo:**
  1. POST `/api/auth/login` — recebe `{ username, password }`, valida contra `users` table (bcrypt), retorna JWT.
  2. Todas as demais rotas exigem header `Authorization: Bearer <token>`.
  3. Filtro Spring Security (`JwtAuthenticationFilter`) que valida o token em cada requisição.
- **Validade do token:** 24 horas (configurável).
- **Usuários:** pré-cadastrados no banco (seed). Sem rota de registro — apenas 2 usuários fixos.

### 3.3 Estrutura de Pacotes

```
com.doravia
├── DoraViaApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtAuthFilter.java
│   ├── JwtUtil.java
│   └── CorsConfig.java
├── controller/
│   ├── AuthController.java
│   ├── CityController.java
│   ├── DayController.java
│   └── ActivityController.java
├── model/
│   ├── User.java
│   ├── City.java
│   ├── Day.java
│   └── Activity.java
├── repository/
│   ├── UserRepository.java
│   ├── CityRepository.java
│   ├── DayRepository.java
│   └── ActivityRepository.java
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── CityDTO.java
│   ├── DayDTO.java
│   └── ActivityDTO.java
└── service/
    ├── AuthService.java
    ├── CityService.java
    ├── DayService.java
    └── ActivityService.java
```

### 3.4 API Endpoints

#### Autenticação
| Método | Rota              | Descrição                |
|--------|-------------------|--------------------------|
| POST   | `/api/auth/login` | Login, retorna JWT       |
| GET    | `/api/auth/me`    | Retorna dados do usuário logado |

#### Cidades
| Método | Rota               | Descrição                     |
|--------|--------------------|-------------------------------|
| GET    | `/api/cities`      | Lista todas as cidades        |
| GET    | `/api/cities/{id}` | Cidade com dias e atividades  |
| POST   | `/api/cities`      | Criar nova cidade             |
| PUT    | `/api/cities/{id}` | Editar cidade                 |
| DELETE | `/api/cities/{id}` | Excluir cidade (cascata)      |
| PATCH  | `/api/cities/reorder` | Reordenar cidades          |

#### Dias
| Método | Rota                              | Descrição                |
|--------|-----------------------------------|--------------------------|
| GET    | `/api/cities/{cityId}/days`       | Lista dias de uma cidade |
| POST   | `/api/cities/{cityId}/days`       | Criar dia                |
| PUT    | `/api/days/{id}`                  | Editar dia               |
| DELETE | `/api/days/{id}`                  | Excluir dia (cascata)    |
| PATCH  | `/api/cities/{cityId}/days/reorder` | Reordenar dias        |

#### Atividades
| Método | Rota                                       | Descrição                     |
|--------|---------------------------------------------|-------------------------------|
| GET    | `/api/days/{dayId}/activities`              | Lista atividades de um dia    |
| GET    | `/api/activities/{id}`                      | Detalhe de uma atividade      |
| POST   | `/api/days/{dayId}/activities`              | Criar atividade               |
| PUT    | `/api/activities/{id}`                      | Editar atividade              |
| DELETE | `/api/activities/{id}`                      | Excluir atividade             |
| PATCH  | `/api/days/{dayId}/activities/reorder`      | Reordenar atividades          |
| PATCH  | `/api/activities/{id}/purchased`            | Marcar/desmarcar como comprado |

### 3.5 SQLite no Spring Boot

Configuração no `application.properties`:

```properties
spring.datasource.url=jdbc:sqlite:data/doravia.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.sql.init.mode=always
spring.jpa.open-in-view=false
```

### 3.6 Importação Inicial do CSV

Endpoint de uso único para bootstrap dos dados:

| Método | Rota              | Descrição                                    |
|--------|-------------------|----------------------------------------------|
| POST   | `/api/import/csv` | Recebe o CSV no body, insere tudo no banco   |

- O CSV é enviado como `multipart/form-data` ou texto puro no body.
- O back-end faz o parsing, agrupa por cidade → dia → atividades, e insere na ordem correta.
- Retorna resumo do que foi importado (ex: "4 cidades, 11 dias, 87 atividades").
- Idealmente executado uma única vez, logo após o primeiro deploy. Pode ser chamado via curl/Postman ou por um botão na dashboard admin (com aviso de "isso já foi feito?").

---

## 4. Frontend (React + Vite)

### 4.1 Dependências

- `react` + `react-dom` + `react-router-dom`
- `axios` (requisições HTTP)
- `tailwindcss` (estilização utilitária, rápida)
- `lucide-react` (ícones leves)
- `react-hot-toast` (notificações)

### 4.2 Estrutura de Rotas (React Router)

```
/login                  → Tela de login (pública)
/                       → Dashboard principal (roteiro completo)
/cities/:cityId         → Detalhe da cidade com dias
/days/:dayId            → Detalhe do dia com lista de atividades
/activities/:id         → Detalhe de uma atividade
/admin                  → Dashboard administrativa
/admin/cities           → CRUD cidades
/admin/days/:cityId     → CRUD dias
/admin/activities/:dayId → CRUD atividades
```

### 4.3 Fluxo de Navegação

```
Login → Dashboard (visão geral do roteiro, linha do tempo)
        ├── Cards de cidades (Roma, Florença, Verona, Veneza)
        │    └── Ao clicar → Dias da cidade
        │         └── Ao clicar no dia → Atividades do dia
        │              └── Ao clicar na atividade → Detalhes completos
        └── Link para /admin → Painel de administração
             └── CRUD de cidades, dias e atividades
```

### 4.4 Layout

**Tema escuro** (apropriado para viagem, legível no celular). Design responsivo, mobile-first — o site será acessado durante a viagem no celular.

- **Sidebar/Header**: logo "DoraVia", nome do usuário logado, botão de logout
- **Conteúdo principal**: roteiro em formato de timeline/cards
- **Admin**: painel com tabelas e formulários modais

### 4.5 Telas

#### Tela de Login
- Formulário simples: username + senha
- Validação inline
- Em caso de erro, mensagem "Usuário ou senha inválidos"

#### Dashboard (Roteiro Completo)
- Visão geral: lista de cidades na ordem da viagem
- Cada cidade colapsável/expansível
- Ao expandir: mostra os dias daquela cidade
- Cada dia mostra horário e resumo das atividades
- Indicador visual de ingressos comprados (check verde) vs não comprados

#### Detalhe do Dia
- Timeline vertical com cada atividade
- Cada card de atividade mostra: horário, título, valor, status de compra, transporte
- Ao clicar: abre modal/página com detalhes completos (descrição, curiosidades, horários de funcionamento, link do mapa)

#### Detalhe da Atividade
- Título, horário, descrição completa
- Preço e status de compra
- Horários de funcionamento
- Transporte e link do Google Maps (abre em nova aba)
- Curiosidades (texto formatado)
- Foto (se houver)

#### Dashboard Admin
- Tabela de cidades com botões editar/excluir/adicionar
- Ao selecionar cidade: tabela de dias
- Ao selecionar dia: tabela de atividades
- Formulários em modal para criar/editar cada entidade
- Reordenação via drag-and-drop ou botões de seta
- Botão para marcar/desmarcar "comprado" diretamente na lista

### 4.6 Fluxo de Autenticação no Frontend

1. Usuário faz login → recebe JWT
2. JWT armazenado no `localStorage`
3. Axios interceptor adiciona `Authorization: Bearer <token>` em toda requisição
4. Axios interceptor captura 401 → redireciona para /login
5. Ao carregar o app, verifica se token existe e não expirou

---

## 5. Docker

### 5.1 Estrutura

```
DoraVia/
├── backend/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── Dockerfile
│   └── package.json
├── db/
│   └── doravia.db          (SQLite, gerado na primeira execução)
├── docker-compose.yml
└── .env
```

### 5.2 docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    volumes:
      - ./db:/app/data
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION=86400000

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:8080/api
```

### 5.3 Backend Dockerfile
- Multi-stage: build com Maven, runtime com JRE 17 slim
- EXPOSE 8080
- Entrypoint: `java -jar app.jar`

### 5.4 Frontend Dockerfile
- Multi-stage: build node, serve com nginx (imagem leve)
- Configura nginx como proxy reverso para o backend
- EXPOSE 80

---

## 6. Plano de Implementação (Ordem Sugerida)

| Fase | Descrição | Estimativa |
|------|-----------|------------|
| 1 | Setup do projeto Spring Boot + SQLite + entidades + migrations | 2h |
| 2 | Autenticação JWT (backend) | 2h |
| 3 | CRUD de cidades, dias e atividades (backend) | 4h |
| 4 | Setup do frontend (Vite + React + Tailwind + rotas) | 2h |
| 5 | Tela de login | 1h |
| 6 | Dashboard do roteiro | 4h |
| 7 | Detalhes do dia e da atividade | 3h |
| 8 | Dashboard admin (CRUD) | 4h |
| 9 | Dockerização (backend + frontend + compose) | 2h |
| 10 | Importação inicial do CSV e povoamento | 1h |

---

## 7. Observações Finais

- **Dados iniciais:** o CSV atual contém Roma, Florença, Verona e Veneza. Os dias 21/08 e 04-05/09 não estão no CSV — deverão ser cadastrados manualmente via admin após a importação.
- **SQLite:** o arquivo `doravia.db` será criado automaticamente na primeira execução. Para persistência em produção, montar volume Docker.
- **JWT Secret:** deve ser configurado via variável de ambiente (`JWT_SECRET`). Nunca hardcoded.
- **Portas:** frontend na 80 (nginx), backend na 8080.
- **Acessibilidade:** site pensado para uso mobile durante a viagem.

---

**Próximos passos:** Após sua validação, começo pela Fase 1 (setup do backend + banco) ou ajustes na especificação.
