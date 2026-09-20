# Support CRM & Ticketing System

A full-stack, production-ready Customer Support Ticketing CRM built for the Datastraw Technologies hiring assessment. This application provides a centralized dashboard for support teams to manage, triage, search, and resolve customer issues efficiently.

---

## Tech Stack & Architecture

* **Backend:** Node.js & Express (Monolith architecture serving static assets and REST API)
* **Database:** SQLite (Relational structure featuring `tickets` and `notes` tables connected via foreign keys)
* **Frontend:** HTML5, Tailwind CSS (via CDN), and Vanilla JavaScript
* **Deployment:** Render / Railway

---

## Core Features

1. **Ticket Creation & Management:** Automatically generates unique ticket IDs (e.g., `TKT-001`) with secure timestamping.
2. **Dashboard Overview:** Clean table list view displaying ticket ID, customer name, subject, priority, status badges, and creation dates.
3. **Instant Search & Status Filtering:** Real-time search across customer names, emails, IDs, and descriptions, alongside filter buttons (`All`, `Open`, `In Progress`, `Closed`).
4. **Detail & Activity View:** Detailed modal for viewing full customer information and managing ticket lifecycles.

---

## Bonus / Standout Features Added

* **Priority Triage System (`Low`, `Medium`, `High`):** Designed around real-world workflows where support agents triage incoming requests based on severity.
* **Dashboard Summary Metrics:** Dynamic stat cards at the top tracking **Total**, **Open**, **In Progress**, and **Closed** counts instantly.
* **Internal Activity Notes History:** A relational `notes` log that tracks agent updates and comments chronologically.
* **Data Validation:** Built-in front-end and back-end email format verification to ensure clean data integrity.

---

## Local Setup & Installation Instructions

Follow these steps to run the project locally on your machine:

### 1. Clone the Repository
```bash
git clone [https://github.com/anurag123-at/support-crm.git](https://github.com/anurag123-at/support-crm.git)
cd support-crm

2. Install Dependencies

npm install

3. Configure Environment Variables
Create a .env file in the root directory and add:

PORT=3000

4. Start the Server
Using nodemon (recommended for development):


npx nodemon server.js
Or using standard Node:

node server.js

5. Access the App
Open your browser and navigate to http://localhost:3000.

API Endpoints Reference
POST /api/tickets — Creates a new support ticket

GET /api/tickets — Lists all tickets (supports ?status= and ?search= query params)

GET /api/stats — Fetches summary counter metrics for the dashboard

GET /api/tickets/:id — Fetches details and activity notes for a specific ticket

PUT /api/tickets/:id — Updates status/priority and appends internal activity notes

Demo Video & Live Application
Live Deployed App: https://support-crm-jsz9.onrender.com/ 

Demo Walkthrough Video: [Insert Loom/YouTube Video Link Here]