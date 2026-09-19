### 1. The `.env` and `.gitignore` Check

* **The `.env` & `process.env.PORT` setup:** **Yes, this is completely correct!** Writing `PORT = 3000` in your `.env` file and using `process.env.PORT || 3000` in `server.js` is the industry standard. It allows your app to run locally on port 3000 while automatically adapting to whatever dynamic port Render or Railway assigns it in production. *(Note: If you use a `.env` file locally, make sure to install `dotenv` by running `npm install dotenv` and adding `require('dotenv').config();` at the very top of `server.js`, otherwise `process.env.PORT` might be undefined locally!)*
* **The `.gitignore` setup:** **Warning: A major correction is needed here!**
* **DO NOT ignore `package.json` or `package-lock.json**`. These files **must** be committed and pushed to GitHub. Render and Railway need your `package.json` to know what dependencies (`express`, `sqlite3`, `cors`) to install when building your app. If you ignore them, your deployment will crash.
* **What you SHOULD put in `.gitignore`:** `.env`, `node_modules/`, and `support.db` (your local SQLite database file so you don't commit local test data).



Here is the correct `.gitignore` file text you should use:

```text
node_modules/
.env
support.db

```

---

### 2. Complete `README.md` Content

Copy this content, save it into a file named **`README.md`** in your project root, and you're good to go:

```markdown
# 🚀 Support CRM & Ticketing System

A full-stack, production-ready Customer Support Ticketing CRM built for the Datastraw Technologies hiring assessment[cite: 1]. This application provides a centralized dashboard for support teams to manage, triage, search, and resolve customer issues efficiently.

---

## 🛠️ Tech Stack & Architecture

* **Backend:** Node.js & Express (Monolith Architecture serving static assets and REST API)[cite: 1]
* **Database:** SQLite (Relational structure featuring `tickets` and `notes` tables connected via foreign keys)[cite: 1]
* **Frontend:** HTML5, Tailwind CSS (via CDN for zero-build overhead), and Vanilla JavaScript[cite: 1]
* **Deployment:** Render / Railway[cite: 1]

---

## 📌 Core Features

1. **Ticket Creation & Management:** Automatically generates unique ticket IDs (e.g., `TKT-001`) with secure timestamping[cite: 1].
2. **Dashboard Overview:** Clean table list view displaying ticket ID, customer name, subject, priority, status badges, and creation dates[cite: 1].
3. **Instant Search & Status Filtering:** Real-time search across customer names, emails, IDs, and descriptions, alongside filter buttons (`All`, `Open`, `In Progress`, `Closed`)[cite: 1].
4. **Detail & Activity View:** Detailed modal for viewing full customer information and managing ticket lifecycles[cite: 1].

---

## 🌟 Bonus / Standout Features Added
* **Priority Triage System (`Low`, `Medium`, `High`):** Designed around real-world workflows where support agents triage incoming requests based on severity.
* **Dashboard Summary Metrics:** Dynamic stat cards at the top tracking **Total**, **Open**, **In Progress**, and **Closed** counts instantly.
* **Internal Activity Notes History:** A relational `notes` log that tracks agent updates and comments chronologically[cite: 1].
* **Data Validation:** Built-in front-end and back-end email format verification to ensure clean data integrity.

---

## ⚙️ Local Setup & Installation Instructions

Follow these steps to run the project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/support-crm.git](https://github.com/YOUR_USERNAME/support-crm.git)
   cd support-crm

```

2. **Install dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env` file in the root directory and add:
```env
PORT=3000

```


4. **Start the server:**
Using `nodemon` (recommended for development):
```bash
npx nodemon server.js

```


Or using standard Node:
```bash
node server.js

```


5. **Open in your browser:**
Navigate to `http://localhost:3000`.



---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/tickets` | Creates a new support ticket

 |
| **GET** | `/api/tickets` | Lists all tickets (supports `?status=` and `?search=` query params)

 |
| **GET** | `/api/stats` | Fetches summary counter metrics for the dashboard |
| **GET** | `/api/tickets/:id` | Fetches details and activity notes for a specific ticket

 |
| **PUT** | `/api/tickets/:id` | Updates status/priority and appends internal activity notes

 |

---

## 🎥 Demo Video & Live Application

* **Live Deployed App:** [Insert Render Public URL Here]


* **Demo Walkthrough Video:** [Insert Loom/YouTube Video Link Here]



```

```