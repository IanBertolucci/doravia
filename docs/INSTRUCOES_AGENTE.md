# DoraVia — Instruções Completas para o Agente

Construa um site completo chamado **DoraVia**: um guia de bolso digital privado para uma viagem à Europa. Abaixo está tudo o que precisa saber — arquitetura, modelo de dados, backend, frontend, endpoints, telas e Docker. Implemente **todas as fases** em sequência.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Java 17 + Spring Boot 3 + Maven |
| Frontend | React 18 + Vite + Tailwind CSS |
| Banco | SQLite (arquivo único `data/doravia.db`) |
| Autenticação | JWT (jjwt 0.12.x) |
| Deploy | Docker (nginx + spring boot jar) |

---

## Estrutura do Projeto

```
DoraVia/
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/doravia/
│       │   ├── DoraViaApplication.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java
│       │   │   ├── JwtAuthFilter.java
│       │   │   ├── JwtUtil.java
│       │   │   ├── CorsConfig.java
│       │   │   └── DataInitializer.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── CityController.java
│       │   │   ├── DayController.java
│       │   │   ├── ActivityController.java
│       │   │   └── ImportController.java
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   ├── City.java
│       │   │   ├── Day.java
│       │   │   └── Activity.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── CityRepository.java
│       │   │   ├── DayRepository.java
│       │   │   └── ActivityRepository.java
│       │   ├── dto/
│       │   │   ├── LoginRequest.java
│       │   │   ├── LoginResponse.java
│       │   │   ├── CityDTO.java
│       │   │   ├── DayDTO.java
│       │   │   └── ActivityDTO.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── CityService.java
│       │       ├── DayService.java
│       │       └── ActivityService.java
│       └── resources/
│           └── application.properties
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── Dockerfile
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   ├── Header.jsx
│       │   ├── CityCard.jsx
│       │   ├── DayCard.jsx
│       │   ├── ActivityCard.jsx
│       │   ├── ActivityModal.jsx
│       │   ├── AdminCityForm.jsx
│       │   ├── AdminDayForm.jsx
│       │   └── AdminActivityForm.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── DashboardPage.jsx
│           ├── CityPage.jsx
│           ├── DayPage.jsx
│           ├── ActivityPage.jsx
│           ├── AdminPage.jsx
│           └── AdminActivityPage.jsx
├── cronograma - Detalhado.csv
├── docker-compose.yml
└── .env
```

---

## Modelo de Dados (SQLite)

### users
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK AUTO | |
| username | TEXT NOT NULL UNIQUE | |
| password | TEXT NOT NULL | bcrypt hash |
| display_name | TEXT NOT NULL | |
| created_at | TEXT NOT NULL | datetime('now') |

### cities
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK AUTO | |
| name | TEXT NOT NULL | ex: "Roma" |
| display_order | INTEGER NOT NULL DEFAULT 0 | |

### days
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK AUTO | |
| city_id | INTEGER NOT NULL FK → cities | ON DELETE CASCADE |
| label | TEXT NOT NULL | ex: "22 (sábado)" |
| display_order | INTEGER NOT NULL DEFAULT 0 | |

### activities
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER PK AUTO | |
| day_id | INTEGER NOT NULL FK → days | ON DELETE CASCADE |
| time_slot | TEXT | ex: "06h50–08h30" |
| title | TEXT NOT NULL | ex: "Panteão" |
| description | TEXT | observações detalhadas |
| price | TEXT | ex: "€24,00" |
| purchased | INTEGER NOT NULL DEFAULT 0 | 0=FALSE, 1=TRUE |
| opening_hours | TEXT | horários de funcionamento |
| transport | TEXT | ex: "A pé - 8 min" |
| map_link | TEXT | URL do Google Maps |
| photo_url | TEXT | URL da foto |
| curiosity | TEXT | curiosidades/texto longo |
| display_order | INTEGER NOT NULL DEFAULT 0 | |

### Índices
```sql
CREATE INDEX idx_days_city_id ON days(city_id);
CREATE INDEX idx_activities_day_id ON activities(day_id);
CREATE INDEX idx_activities_display_order ON activities(day_id, display_order);
```

---

## FASE 1 — Backend: Setup + Entidades + Repositórios + DataInitializer

1. Crie `backend/pom.xml` com:
   - parent: `org.springframework.boot:spring-boot-starter-parent:3.4.1`
   - Java 17
   - Dependências:
     - `spring-boot-starter-web`
     - `spring-boot-starter-data-jpa`
     - `spring-boot-starter-security`
     - `spring-boot-starter-validation`
     - `io.jsonwebtoken:jjwt-api:0.12.6`
     - `io.jsonwebtoken:jjwt-impl:0.12.6` (runtime)
     - `io.jsonwebtoken:jjwt-jackson:0.12.6` (runtime)
     - `org.xerial:sqlite-jdbc:3.45.3.0`
     - `org.hibernate.orm:hibernate-community-dialects:6.6.1.Final`
     - `org.springframework.boot:spring-boot-starter-test` (test)
   - Build plugin: `spring-boot-maven-plugin`

2. Crie `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:sqlite:data/doravia.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.open-in-view=false
server.port=8080
```

3. Crie as entidades JPA em `com.doravia.model`:
   - Use `@Entity`, `@Table`, `@Id`, `@GeneratedValue(strategy = GenerationType.IDENTITY)`
   - Use `@Column(columnDefinition = "TEXT")` nos campos String longos (description, openingHours, curiosity)
   - Use `@ManyToOne(fetch = FetchType.LAZY)` nas relações Day→City e Activity→Day
   - Use `@OnDelete(action = OnDeleteAction.CASCADE)` nas relações para cascade no banco
   - Day tem campo `city` com `@ManyToOne` e `@JoinColumn(name = "city_id")`
   - Activity tem campo `day` com `@ManyToOne` e `@JoinColumn(name = "day_id")`
   - purchased deve ser `Boolean` com default `false`

4. Crie os repositórios em `com.doravia.repository`:
   - `UserRepository extends JpaRepository<User, Long>`
   - `CityRepository extends JpaRepository<City, Long>` com `List<City> findAllByOrderByDisplayOrder()`
   - `DayRepository extends JpaRepository<Day, Long>` com `List<Day> findByCityIdOrderByDisplayOrder(Long cityId)`
   - `ActivityRepository extends JpaRepository<Activity, Long>` com `List<Activity> findByDayIdOrderByDisplayOrder(Long dayId)`

5. Crie `com.doravia.config.DataInitializer implements CommandLineRunner`:
   - Rode apenas com `@Profile("dev")`.
   - Se `userRepository.count() == 0` e `SEED_USERNAME`/`SEED_PASSWORD` estiverem definidos no ambiente, insira um usuário com senha BCrypt.
   - Não versione credenciais padrão.

6. Garanta que `mvn clean compile` compila e `mvn spring-boot:run` sobe na 8080.

---

## FASE 2 — Backend: Autenticação JWT

1. Crie `com.doravia.config.JwtUtil`:
   - `generateToken(String username)` → retorna JWT com subject=username, issuedAt, expiration (24h)
   - `validateToken(String token)` → boolean
   - `getUsername(String token)` → String
   - Leia a chave secreta de variável de ambiente `JWT_SECRET` (nunca hardcode no código)
   - Injete `@Value("${jwt.secret}")` e `@Value("${jwt.expiration:86400000}")`

2. Adicione no application.properties:
```properties
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000
```

3. Crie `com.doravia.config.JwtAuthFilter extends OncePerRequestFilter`:
   - Extrai token do header `Authorization: Bearer <token>`
   - Valida com JwtUtil
   - Seta `SecurityContextHolder` com `UsernamePasswordAuthenticationToken`
   - Ignora rota `/api/auth/login`

4. Crie `com.doravia.config.SecurityConfig`:
   - `@Bean SecurityFilterChain`: desabilita CSRF, stateless session, permite POST `/api/auth/login` sem auth, exige auth para qualquer outra rota
   - Adiciona `JwtAuthFilter` antes de `UsernamePasswordAuthenticationFilter`
   - `@Bean PasswordEncoder → BCryptPasswordEncoder`
   - `@Bean AuthenticationManager` a partir do `AuthenticationConfiguration`

5. Crie `com.doravia.config.CorsConfig`:
   - Permite origem do frontend (http://localhost:5173 em dev)
   - Permite métodos GET, POST, PUT, DELETE, PATCH, OPTIONS
   - Permite header Authorization

6. Crie DTOs em `com.doravia.dto`:
   - `LoginRequest` com username e password (validation @NotBlank)
   - `LoginResponse` com token (String)

7. Crie `com.doravia.service.AuthService`:
   - `authenticate(LoginRequest) → LoginResponse`: autentica com AuthenticationManager, gera token

8. Crie `com.doravia.controller.AuthController`:
   - POST `/api/auth/login` → recebe LoginRequest, retorna LoginResponse
   - GET `/api/auth/me` → retorna username e displayName do usuário logado (lê do SecurityContext)

9. Teste com curl: POST para `/api/auth/login` deve retornar JWT.

---

## FASE 3 — Backend: CRUD Cidades, Dias, Atividades + Import CSV

1. Crie serviços em `com.doravia.service`:

   **CityService:**
   - `List<City> findAll()` → ordenado por displayOrder
   - `City findById(Long id)`
   - `City create(String name)` → cria com displayOrder = max+1
   - `City update(Long id, String name)`
   - `void delete(Long id)`
   - `void reorder(List<Long> cityIds)` → atualiza displayOrder conforme posição no array

   **DayService:**
   - `List<Day> findByCityId(Long cityId)` → ordenado por displayOrder
   - `Day findById(Long id)`
   - `Day create(Long cityId, String label)`
   - `Day update(Long id, String label)`
   - `void delete(Long id)`
   - `void reorder(Long cityId, List<Long> dayIds)`

   **ActivityService:**
   - `List<Activity> findByDayId(Long dayId)` → ordenado por displayOrder
   - `Activity findById(Long id)`
   - `Activity create(Long dayId, Activity activity)`
   - `Activity update(Long id, Activity activity)`
   - `void delete(Long id)`
   - `void reorder(Long dayId, List<Long> activityIds)`
   - `void togglePurchased(Long id)` → inverte o boolean purchased

2. Crie DTOs:
   - `CityDTO` com id, name, displayOrder
   - `DayDTO` com id, cityId, label, displayOrder
   - `ActivityDTO` com todos os campos da entidade

3. Crie controllers em `com.doravia.controller`:

   **CityController** (`/api/cities`):
   - GET `/` → lista cidades
   - GET `/{id}` → cidade com dias e atividades (retorna CityDTO com lists aninhadas)
   - POST `/` → cria (body: { "name": "..." })
   - PUT `/{id}` → edita
   - DELETE `/{id}` → exclui (cascade via banco)
   - PATCH `/reorder` → body: { "cityIds": [3, 1, 2] }

   **DayController** (`/api/cities/{cityId}/days` e `/api/days/{id}`):
   - GET `/api/cities/{cityId}/days` → lista dias da cidade
   - POST `/api/cities/{cityId}/days` → cria (body: { "label": "..." })
   - PUT `/api/days/{id}` → edita
   - DELETE `/api/days/{id}` → exclui
   - PATCH `/api/cities/{cityId}/days/reorder` → body: { "dayIds": [...] }

   **ActivityController** (`/api/days/{dayId}/activities` e `/api/activities/{id}`):
   - GET `/api/days/{dayId}/activities` → lista atividades do dia
   - GET `/api/activities/{id}` → detalhe
   - POST `/api/days/{dayId}/activities` → cria (body com campos da Activity)
   - PUT `/api/activities/{id}` → edita
   - DELETE `/api/activities/{id}` → exclui
   - PATCH `/api/days/{dayId}/activities/reorder` → body: { "activityIds": [...] }
   - PATCH `/api/activities/{id}/purchased` → toggle

4. Crie **ImportController** (`/api/import`):
   - POST `/csv` → aceita `multipart/file`, faz parsing do CSV
   - Formato esperado do CSV (já está em `cronograma - Detalhado.csv`):
     - Coluna B: Local (cidade)
     - Coluna C: Dia (ex: "22 (sábado)")
     - Coluna D: Horários do dia
     - Coluna E: O que fazer (title)
     - Coluna F: Observações (description)
     - Coluna G: Valor (price)
     - Coluna H: Comprado (TRUE/FALSE)
     - Coluna I: Horários (opening_hours)
     - Coluna J: Deslocamentos (transport)
     - Coluna K: Mapa (map_link)
     - Coluna L: Foto (photo_url)
     - Coluna M: Curiosidade (curiosity)
   - Agrupa por cidade → dia → atividades, insere na ordem
   - Retorna JSON: { "cities": 4, "days": 11, "activities": 87 }
   - Se o CSV não for encontrado ou estiver vazio, retorna erro 400

5. Adicione validação `@Valid` nos endpoints de criação/atualização.

---

## FASE 4 — Frontend: Setup do Projeto

1. Na pasta `frontend/`, crie o projeto com Vite + React:
   ```bash
   npm create vite@latest . -- --template react
   ```

2. Instale dependências:
   ```bash
   npm install react-router-dom axios tailwindcss @tailwindcss/vite lucide-react react-hot-toast
   ```

3. Configure Tailwind:
   - Adicione `@tailwindcss/vite` nos plugins do `vite.config.js`
   - Adicione no `index.css`:
     ```css
     @import "tailwindcss";
     ```
   - Configure tailwind para modo dark por classe (`.dark`)

4. Crie `src/api.js` com axios instance:
   - `baseURL`: `http://localhost:8080/api` (muda para `/api` em produção)
   - Interceptor de request: adiciona `Authorization: Bearer <token>` do localStorage
   - Interceptor de response: se 401, limpa localStorage e redireciona para `/login`
   - Exporte funções: `login()`, `getCities()`, `getCity()`, `getDays()`, `getDay()`, `getActivities()`, `getActivity()`, `createCity()`, `updateCity()`, `deleteCity()`, `reorderCities()`, etc. (todos os endpoints do backend)

5. Crie `src/context/AuthContext.jsx`:
   - Provider com estado: user, token, loading
   - `login(username, password)` → chama API, salva token no localStorage, seta user
   - `logout()` → limpa localStorage, redireciona
   - `isAuthenticated` → baseado no token

6. Configure `src/main.jsx` com BrowserRouter + AuthProvider + Toaster.

7. Crie `src/App.jsx` com as rotas:
   ```jsx
   <Routes>
     <Route path="/login" element={<LoginPage />} />
     <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
     <Route path="/cities/:cityId" element={<ProtectedRoute><CityPage /></ProtectedRoute>} />
     <Route path="/days/:dayId" element={<ProtectedRoute><DayPage /></ProtectedRoute>} />
     <Route path="/activities/:id" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
     <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
     <Route path="/admin/activities/:dayId" element={<ProtectedRoute><AdminActivityPage /></ProtectedRoute>} />
   </Routes>
   ```

8. Crie `src/components/ProtectedRoute.jsx`:
   - Se não autenticado e não loading, redireciona para `/login`
   - Se loading, mostra spinner

9. Crie `src/components/Header.jsx`:
   - Logo "DoraVia", botão de logout, nome do usuário
   - Link para /admin visível em todas as páginas (ícone de engrenagem)

10. Garanta que `npm run dev` sobe o frontend.

---

## FASE 5 — Frontend: Tela de Login

1. Crie `src/pages/LoginPage.jsx`:
   - Fundo escuro com gradiente
   - Card centralizado com formulário
   - Campos: username (text) e senha (password)
   - Validação inline: campos obrigatórios
   - Botão "Entrar" com loading state
   - Em erro: toast "Usuário ou senha inválidos"
   - Em sucesso: redireciona para `/`
   - Design responsivo, mobile-first

---

## FASE 6 — Frontend: Dashboard do Roteiro

1. Crie `src/pages/DashboardPage.jsx`:
   - Header fixo no topo
   - Lista de cidades como cards horizontais
   - Cada card: nome da cidade, número de dias, indicador de ingressos comprados
   - Ao clicar: expande/colapsa mostrando os dias
   - Cada dia: label (ex: "22 (sábado)") + resumo das atividades + indicador de compra
   - Ao clicar no dia: navega para `/cities/:cityId` (ou abre detalhe inline)
   - Loading state enquanto busca dados
   - Tema escuro, responsivo

---

## FASE 7 — Frontend: Detalhes do Dia e da Atividade

1. Crie `src/pages/CityPage.jsx`:
   - Header com nome da cidade e botão voltar
   - Timeline vertical dos dias
   - Cada dia expandível: mostra atividades daquele dia

2. Crie `src/components/DayCard.jsx`:
   - Label do dia, horário, lista resumida de atividades
   - Ao clicar: navega para `/days/:dayId`

3. Crie `src/pages/DayPage.jsx`:
   - Header com label do dia e botão voltar
   - Timeline vertical de atividades
   - Cada atividade: horário, título, valor (se houver), status compra (check verde/vermelho), transporte
   - Ao clicar na atividade: abre modal (ActivityModal) ou navega para `/activities/:id`

4. Crie `src/pages/ActivityPage.jsx`:
   - Detalhes completos:
     - Título grande
     - Horário
     - Descrição/observações
     - Preço e status de compra (com toggle se admin)
     - Horários de funcionamento formatados
     - Transporte
     - Link do Google Maps (abre em nova aba)
     - Curiosidades (texto formatado, parágrafos)
     - Foto (se houver, exibe imagem)

5. Crie `src/components/ActivityModal.jsx`:
   - Modal com os mesmos detalhes da ActivityPage
   - Fechar ao clicar fora ou no X

---

## FASE 8 — Frontend: Dashboard Admin

1. Crie `src/pages/AdminPage.jsx`:
   - Tabela de cidades com colunas: nome, ordem, ações (editar, excluir)
   - Botão "Adicionar Cidade"
   - Ao clicar em editar: modal `AdminCityForm` pré-preenchido
   - Ao clicar em excluir: confirmação e exclusão
   - Ao expandir cidade: tabela de dias (label, ordem, ações)
   - Botões de seta para cima/baixo para reordenar (ou drag-and-drop simples)
   - Ao clicar em "Atividades" de um dia: navega para `/admin/activities/:dayId`

2. Crie `src/pages/AdminActivityPage.jsx`:
   - Header com label "Atividades do dia X"
   - Tabela de atividades com colunas: horário, título, valor, comprado (checkbox), ações
   - Botão "Adicionar Atividade"
   - Modal `AdminActivityForm` para criar/editar
   - Checkbox "Comprado" com toggle inline (PATCH /purchased)
   - Botões de seta para reordenar

3. Crie `src/components/AdminCityForm.jsx`:
   - Modal com campo nome
   - Botões Cancelar e Salvar

4. Crie `src/components/AdminDayForm.jsx`:
   - Modal com campo label (ex: "22 (sábado)")
   - Botões Cancelar e Salvar

5. Crie `src/components/AdminActivityForm.jsx`:
   - Modal com todos os campos da atividade:
     - timeSlot (text), title (text), description (textarea), price (text)
     - purchased (checkbox), openingHours (textarea), transport (text)
     - mapLink (text), photoUrl (text), curiosity (textarea)
   - Botões Cancelar e Salvar

6. Proteja todas as rotas admin com verificação de autenticação (já feito pelo ProtectedRoute).

---

## FASE 9 — Docker

1. Crie `backend/Dockerfile` multi-stage:
   ```dockerfile
   # Stage 1: Build
   FROM maven:3.9-eclipse-temurin-17 AS build
   WORKDIR /app
   COPY pom.xml .
   RUN mvn dependency:go-offline -B
   COPY src ./src
   RUN mvn clean package -DskipTests

   # Stage 2: Runtime
   FROM eclipse-temurin:17-jre-alpine
   WORKDIR /app
   COPY --from=build /app/target/*.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

2. Crie `frontend/Dockerfile` multi-stage:
   ```dockerfile
   # Stage 1: Build
   FROM node:20-alpine AS build
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # Stage 2: Serve with nginx
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. Crie `frontend/nginx.conf`:
   ```nginx
   server {
       listen 80;
       location / {
           root /usr/share/nginx/html;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
       location /api/ {
           proxy_pass http://backend:8080/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. Crie `docker-compose.yml`:
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
   ```

5. Crie `.env`:
   ```
   JWT_SECRET=change-me-to-a-long-random-string-with-at-least-256-bits
   ```

---

## FASE 10 — Povoamento Inicial

1. Após o deploy, chame o endpoint de importação:
   ```bash
   curl -X POST http://localhost:8080/api/import/csv \
     -F "file=@cronograma - Detalhado.csv" \
     -H "Authorization: Bearer <token>"
   ```

2. Alternativamente, crie um botão na dashboard admin "Importar CSV" que faz upload do arquivo e chama o endpoint.

---

## Regras Gerais

- **Não adicione comentários no código** a menos que seja estritamente necessário
- Siga convenções do Spring Boot (injeção por construtor, anotações padrão)
- Frontend em tema escuro, mobile-first, responsivo
- Use `lucide-react` para ícones (Menu, LogOut, Settings, ChevronDown, Check, X, Plus, Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, MapPin, Clock, DollarSign, Info)
- Use `react-hot-toast` para notificações de sucesso/erro
- Estados de loading com spinner em todas as telas que fazem requisição
- Trate erros de API com toast de erro
- O CSV "cronograma - Detalhado.csv" está na raiz do projeto e deve ser lido pelo ImportController

---

## Verificação Final

Após implementar todas as fases, verifique:
1. `mvn clean package` compila o backend sem erros
2. `npm run build` compila o frontend sem erros
3. `docker compose build` constrói as imagens sem erros
4. O fluxo completo: login → dashboard → detalhes → admin → CRUD → reorder
5. A importação do CSV povoa o banco corretamente
