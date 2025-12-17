## DevOps Hosting – Infra overview

Dit project gaat ervan uit dat Pterodactyl Panel en Wings al draaien op dezelfde of een andere host (bijv. aparte EC2-instanties).  
Deze monorepo levert de **klant-facing DevOps Hosting laag** bestaande uit een frontend en backend.  

- **Compute**: AWS EC2 (Ubuntu 22.04) voor dit project (frontend + backend containers).
- **Orchestratie**: `docker compose` voor lokale en single-node EC2 deployments.
- **Externe afhankelijkheid**: bestaand Pterodactyl Panel (admin only) + Wings nodes voor game servers.

### Basis deployment stappen (EC2)

1. Check-out code:
   - `git clone <repo>`
   - `cd DevOps`
2. Configureer environment (bijv. via `/etc/environment` of een `.env` die je zelf beheert):
   - `DATABASE_URL`
   - `PTERO_BASE_URL`
   - `PTERO_API_KEY`
   - Optional: `PTERO_DEFAULT_*` variabelen
3. Build & run:
   - `docker compose build`
   - `docker compose up -d`

### CI/CD ready

De structuur maakt het eenvoudig om een pipeline toe te voegen (GitHub Actions / GitLab CI):

- Stap 1: `docker build` voor `backend` en `frontend`.
- Stap 2: Push images naar een container registry (ECR, GHCR, ...).
- Stap 3: Deploy job op EC2 (bijvoorbeeld via SSH runner) die `docker compose pull && docker compose up -d` uitvoert.

### Credits

DevOps Hosting is ontwikkeld door **Zendé, Lucas, Daniel & André** als DevOps-project.


