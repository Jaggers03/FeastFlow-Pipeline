# 🍕 FeastFlow — Food Delivery App with Jenkins CI/CD

> A full-stack food delivery web application demonstrating a comprehensive  
> **Jenkins CI/CD pipeline** as described in the ICSSAS 2023 research paper:  
> *"Efficient Automation of Web Application Development and Deployment using Jenkins"*

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Jenkins Pipeline                    │
│                                                      │
│  Checkout → Lint → Test → Docker Build →            │
│  Integration Test → Security Scan →                 │
│  Publish to Registry → Deploy Staging →             │
│  Smoke Test → Deploy Production                     │
└─────────────────────────────────────────────────────┘
        │               │
        ▼               ▼
 ┌──────────────┐  ┌──────────────┐
 │  Frontend    │  │  Backend     │
 │  (HTML/Nginx)│  │  (Node.js)   │
 │  Port 8080   │  │  Port 3001   │
 └──────────────┘  └──────────────┘
        │               │
        └───────┬───────┘
                ▼
       Docker Registry :5000
```

---

## 🍎 macOS Setup Guide

### Prerequisites — Install These First

Open **Terminal** (Cmd + Space → type "Terminal") and run each step:

---

### Step 1: Install Homebrew (macOS package manager)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
After install, follow the instructions to add Homebrew to your PATH.  
Verify: `brew --version`

---

### Step 2: Install Node.js 18+
```bash
brew install node@18
echo 'export PATH="/opt/homebrew/opt/node@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```
Verify: `node --version`  (should show v18.x.x)

---

### Step 3: Install Docker Desktop
1. Download from: https://www.docker.com/products/docker-desktop/
2. Open the `.dmg` file and drag Docker to Applications
3. Open Docker from Applications and wait for it to start (whale icon in menu bar)
4. Verify: `docker --version` and `docker-compose --version`

**⚠️ Apple Silicon (M1/M2/M3 Mac):** Docker Desktop works natively — no extra steps needed.

---

### Step 4: Install Git
```bash
brew install git
git --version
```
Configure Git:
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

### Step 5: Install Jenkins

**Option A — Docker (Recommended, easiest)**
```bash
docker run -d \
  --name jenkins \
  --restart unless-stopped \
  -p 8090:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17
```

Get the initial admin password:
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Open Jenkins at: **http://localhost:8090**  
Paste the password and follow the setup wizard. Install **suggested plugins**.

**Option B — Homebrew**
```bash
brew install jenkins-lts
brew services start jenkins-lts
```
Open: **http://localhost:8080**

---

### Step 6: Clone & Run the Project

```bash
# Clone the repo (or use the folder you already have)
cd ~/Desktop
git clone https://github.com/YOUR_USERNAME/feastflow.git
# (or just cd into the project folder)
cd feastflow

# Install backend dependencies
cd backend
npm install
npm test       # Run tests — should all pass ✅
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 7: Run Locally (without Jenkins/Docker)

**Terminal 1 — Start Backend:**
```bash
cd feastflow/backend
npm start
# API running at http://localhost:3001
# Health check: http://localhost:3001/api/health
```

**Terminal 2 — Start Frontend:**
```bash
cd feastflow/frontend
npx serve src -p 8080
# Open http://localhost:8080
```

---

### Step 8: Run with Docker Compose

```bash
cd feastflow

# 1. Start local Docker registry
docker run -d -p 5000:5000 --name registry registry:2

# 2. Build images
docker build -t localhost:5000/feastflow-backend:latest ./backend
docker build -t localhost:5000/feastflow-frontend:latest ./frontend

# 3. Push to local registry
docker push localhost:5000/feastflow-backend:latest
docker push localhost:5000/feastflow-frontend:latest

# 4. Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Open app
open http://localhost:8080
```

---

### Step 9: Configure Jenkins Pipeline

1. Open Jenkins at **http://localhost:8090**
2. Click **"New Item"**
3. Name it `feastflow-pipeline`, choose **Pipeline**, click OK
4. Under **Pipeline → Definition**: choose **Pipeline script from SCM**
5. Set SCM to **Git**, paste your repo URL
6. Set **Script Path** to `Jenkinsfile`
7. Click **Save**, then **Build Now**

**Jenkins plugins to install** (Manage Jenkins → Plugins):
- Docker Pipeline
- Email Extension
- Git
- Pipeline: Stage View
- JUnit

---

### Step 10: Install Optional Tools

```bash
# Hadolint — Dockerfile linter (used in Lint stage)
brew install hadolint

# Trivy — Security scanner (used in Security Scan stage)
brew install trivy
```

---

## 📁 Project Structure

```
feastflow/
├── Jenkinsfile                 ← CI/CD pipeline definition
├── docker-compose.yml          ← Production deployment
├── docker-compose.staging.yml  ← Staging deployment
├── docker-compose.test.yml     ← Integration test environment
├── package.json                ← Root scripts
│
├── backend/
│   ├── src/
│   │   ├── server.js           ← Express.js entry point
│   │   └── routes/
│   │       ├── restaurants.js  ← Restaurant CRUD API
│   │       ├── menu.js         ← Menu items API
│   │       ├── orders.js       ← Order placement + tracking
│   │       └── auth.js         ← Auth (login/register)
│   ├── tests/
│   │   └── api.test.js         ← Jest unit tests
│   ├── Dockerfile              ← Multi-stage Docker build
│   ├── .eslintrc.json          ← ESLint configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   └── index.html          ← Complete SPA (HTML + CSS + JS)
    ├── nginx.conf              ← Nginx config with API proxy
    ├── Dockerfile              ← Nginx production image
    └── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint                     | Description              |
|--------|------------------------------|--------------------------|
| GET    | `/api/health`                | Health check (Jenkins)   |
| GET    | `/api/restaurants`           | List all restaurants     |
| GET    | `/api/restaurants?cuisine=X` | Filter by cuisine        |
| GET    | `/api/restaurants/:id`       | Single restaurant        |
| GET    | `/api/menu/:restaurantId`    | Restaurant menu          |
| POST   | `/api/orders`                | Place an order           |
| GET    | `/api/orders/:id`            | Track an order           |
| POST   | `/api/auth/login`            | Login                    |
| POST   | `/api/auth/register`         | Register                 |

---

## 🧪 Pipeline Stages (from Jenkinsfile)

| Stage                  | What it does                                          |
|------------------------|-------------------------------------------------------|
| **Checkout**           | Pulls latest code from Git                            |
| **Lint**               | Checks Dockerfile (hadolint) + JS code (ESLint)       |
| **Test**               | Runs Jest unit tests for frontend and backend         |
| **Build Docker Image** | Builds multi-stage Docker images                      |
| **Integration Tests**  | Spins up real containers, runs API tests              |
| **Security Scan**      | Scans images for CVEs with Trivy                      |
| **Publish to Registry**| Pushes tagged images to Docker registry               |
| **Deploy to Staging**  | Deploys to staging environment                        |
| **Smoke Tests**        | Hits `/api/health` + frontend URL to verify           |
| **Deploy to Production**| Manual approval gate → deploys to production         |

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `docker: command not found` | Open Docker Desktop and wait for it to fully start |
| `port 8080 already in use` | `lsof -ti:8080 \| xargs kill` or change port |
| Jenkins can't run Docker | Mount socket: `-v /var/run/docker.sock:/var/run/docker.sock` |
| `npm install` fails | Make sure Node 18+ is installed: `node --version` |
| Apple M1/M2 Docker issues | Add `platform: linux/amd64` to docker-compose services |
| Jenkins stuck on approval | Click **"Proceed"** in the pipeline stage view |

---

## 📚 Research Paper Reference

This project implements the CI/CD pipeline described in:  
**Badisa Naveen et al.**, *"Efficient Automation of Web Application Development and Deployment using Jenkins: A Comprehensive CI/CD Pipeline for Enhanced Productivity and Quality"*,  
ICSSAS 2023, IEEE. DOI: 10.1109/ICSSAS57918.2023.10331631

Key concepts applied:
- ✅ Jenkins as CI/CD orchestrator (Section III)
- ✅ Pipeline as Code via Jenkinsfile (Section V)
- ✅ Parallel lint stages (Dockerfile + code)
- ✅ Automated testing before Docker build
- ✅ Docker image build + registry publish (like JFrog Artifactory)
- ✅ Staging → Smoke Test → Production gates
- ✅ Email notifications on pass/fail
