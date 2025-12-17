## DevOps Hosting platform

Dit project is een **monorepo** voor het **DevOps Hosting** platform bovenop een bestaande Pterodactyl installatie.  
Pterodactyl zelf wordt **niet aangepast** en dient uitsluitend als admin panel en provisioning layer via de **Application API**.

Structuur:

- `backend` – DevOps Hosting backend: Node/TypeScript REST API (Express) met integratie naar de Pterodactyl Application API.
- `frontend` – DevOps Hosting frontend: React (Vite) SPA die alleen met de eigen backend praat.
- `infra` – Basis infra/DevOps documentatie en deployment-notes.
- `pterodactyl` – Bestaande Pterodactyl panel + Wings setup (los project, niet aangepast).

### Architectuur (high level)

```text
 [Client Browser]
        |
        v
  [Frontend React SPA]
        |
        v
  [Backend REST API]  ----->  [Local DB: users, orders, server mapping]
        |
        v
 [Pterodactyl Panel Application API]  ----->  [Wings nodes / game servers]
```

Belangrijke principes:

- **Pterodactyl is headless** voor klanten: alleen admins gebruiken het panel; alle klantacties lopen via de backend.
- **Clean separation**: frontend ↔ backend ↔ Pterodactyl; geen directe Pterodactyl calls vanuit de browser.
- **Update-safe**: upgrades van Pterodactyl raken de custom code niet; alleen de API wordt gebruikt.

### Backend

Belangrijkste onderdelen (`backend/src`):

- `index.ts` – Express app + routes:
  - `POST /auth/register` – registreert een gebruiker in de eigen business-DB.
  - `POST /servers/order` – provisioning flow:
    - valideert payload (zod),
    - zorgt dat er een Pterodactyl user bestaat (via `external_id`),
    - maakt een server aan via de Application API,
    - slaat de mapping (user ↔ pterodactyl_user ↔ pterodactyl_server) lokaal op.
  - `GET /servers?email=...` – lijst alle servers voor een user.
- `config.ts` – environment based configuration (PORT, DATABASE_URL, PTERO_*).
- `pterodactylService.ts` – service layer rond de Application API:
  - `ensureUserForExternalId` (zoekt of maakt een Pterodactyl user),
  - `createServer` (maakt een server met standaard egg/nest/location/allocation).
- `serverService.ts` – business logica voor registratie + server ordering.
- `repositories.ts` – repository pattern (nu in-memory; eenvoudig te vervangen door PostgreSQL / ORM).

Provisioning flow in tekst:

```text
1. Klant bestelt server via frontend (orderformulier).
2. Frontend doet POST /servers/order naar backend.
3. Backend valideert request en controleert of user bestaat:
   - zo niet: maak lokale user aan.
4. Backend roept Pterodactyl Application API aan:
   - zoek/maak Pterodactyl user op basis van local user.id (external_id).
   - maak server aan met gewenste resources (RAM, disk, CPU).
5. Backend slaat lokale GameServer + Pterodactyl IDs op.
6. Frontend vraagt GET /servers?email=... en toont status.
```

### Frontend

Belangrijkste onderdelen (`frontend/src`):

- `App.tsx` – simpele maar moderne SPA met drie views:
  - **Auth page** (sign-up) – registreert user via `POST /auth/register`.
  - **Dashboard** – toont lijst servers via `GET /servers?email=...`.
  - **Order page** – stuurt server order naar `POST /servers/order`.
- Geen enkele directe call naar Pterodactyl; alle requests gaan via `VITE_API_BASE_URL` → backend.

### Docker / DevOps

- `backend/Dockerfile` – multi-stage build:
  - build TypeScript → JavaScript,
  - runtime image met alleen production dependencies.
- `frontend/Dockerfile` – build React app met Vite, serve via Nginx.
- `docker-compose.yml` – lokale/EC2 stack:
  - `backend` container (poorten 4000),
  - `frontend` container (Nginx op poort 3000),
  - environment variabelen voor Pterodactyl integratie.

Runnen (lokaal of op EC2):

```bash
docker compose build
docker compose up -d
```

Zorg dat je op de host de vereiste env-variabelen zet (`DATABASE_URL`, `PTERO_BASE_URL`, `PTERO_API_KEY`, etc.).  
.env-example files kunnen in een echte pipeline worden toegevoegd; in deze omgeving zijn ze geblokkeerd, dus de README documenteert alle vereiste variabelen.

### Credits

Dit DevOps Hosting project is gemaakt door **Zendé, Lucas, Daniel & André**.

### Waarom dit DevOps-best-practice is

- **Scheiding van concerns**: infra (Docker/compose), app (frontend/backend) en externe panel (Pterodactyl) zijn duidelijk gescheiden.
- **Immutable deployments**: images worden gebuild en uitgerold; configuratie gaat via environment variables.
- **Observability ready**: health endpoint (`/health`) voor monitoring / load balancers.
- **Scalability**: backend en frontend zijn stateless; je kunt horizontaal schalen of later migreren naar ECS/Kubernetes.
- **Update-safe**: Pterodactyl updates raken enkel de API, niet jouw frontend/backend code.

