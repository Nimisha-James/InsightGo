# InsightGo — Business Insight & Churn Analytics Platform

InsightGo is a full-stack local-business analytics platform: business owners
sign in, upload sales/CSV data, view Power BI–style visualizations, read
customer feedback — and now, from the same dashboard, run **explainable
customer-churn prediction** backed by an ensemble ML model, SHAP/LIME
explanations, and a Q-learning feedback loop.

This repository merges two previously separate projects into one product:

- **Local Business Insight Platform** — the MERN app (this repo's frontend
  theme, auth, dashboard, CSV import, review collection, visualizations).
- **Churn Prediction Using XAI & Reinforcement Learning** — a LightGBM
  ensemble classifier (98.76% accuracy) with SHAP + LIME explainability and a
  Q-learning-driven retraining loop that reacts to wrong predictions.

The merge is purely architectural: every model, the preprocessing pipeline,
the SHAP/LIME explainers, and the RL retraining logic are copied over
**unchanged**. What changed is plumbing — one Express API instead of two, one
themed React UI instead of two, consistent ports/paths — so the two systems
run as a single product instead of two disconnected demos. See
["What changed vs. the original repos"](#what-changed-vs-the-original-repos)
for the exact list.

## Highlight (resume-friendly)

> **Churn & Business Analytics Platform using XAI & Reinforcement Learning** — Engineered a
> web-based churn prediction system using LightGBM ensemble learning, achieving 98.76% accuracy
> in predicting subscription retention, integrated with SHAP and LIME for model explainability
> and enhanced with Q-learning-based feedback for automated, real-time, feedback-driven model
> updates. Integrated a business analytics dashboard for real-time sales analysis and customer
> feedback insights, built with React, Node.js/Express and Flask, backed by MongoDB, enabling
> continuous data collection for real-time customer churn prediction.

## Architecture

```
                         ┌─────────────────────────┐
                         │   client (React + Vite)  │  :5173
                         │  business & customer UI  │
                         └────────────┬─────────────┘
                                      │ REST (axios)
                                      ▼
                         ┌─────────────────────────┐
                         │   server (Express API)   │  :8000
                         │  auth · CSV import ·      │
                         │  reviews · /churn/*       │
                         └───────┬─────────┬─────────┘
                                 │         │
                    MONGO_URI    │         │  ML_SERVICE_URL
                                 ▼         ▼
                     ┌───────────────┐   ┌───────────────────────┐
                     │  MongoDB        │◄──│ ml-service (Flask)     │  :5001
                     │  "insightgo"    │  MONGO_URI (same DB)     │
                     │  ────────────   │   LightGBM + SHAP/LIME + │
                     │  businessinfos  │   Q-learning retraining   │
                     │  customerinfos  │   └───────────────────────┘
                     │  import_data    │
                     │  orders (feedback)
                     │  customer_rs (churn)
                     │  wrong_predictions
                     └────────────────┘
```

One database, `insightgo`, for the whole platform — the tables above are all
collections in it, not separate databases. Both `server/` (via Mongoose) and
`ml-service/` (via PyMongo) read `MONGO_URI` from their own `.env` and connect
to the same database, so a CSV import, a business signup, and a churn
prediction all land in one place.

- **client/** — React (Vite) + Tailwind + custom CSS. Business owner, customer
  sign-in/sign-up, CSV upload & visualization, review collection, and the new
  churn prediction pages, all sharing one visual theme.
- **server/** — Express API. Owns business/customer auth, CSV import, reviews,
  search, and a `/churn/*` module that mirrors the original churn-app's own
  Node "db" layer (save record → call the ML service → persist prediction →
  track wrong predictions → trigger RL retraining at the same threshold).
- **ml-service/** — the original Flask app (`predict.py`), the RL retraining
  script (`retrain_with_rl.py`), the trained model artifacts (`model_churn.pkl`,
  `rewards_model.pkl`, …), and `xai.py`/`benchmarking.py` used during research.
  Copied over unchanged aside from the path fixes listed below.
- **research/** — the original dataset-prep notebooks, the training notebook,
  and the papers referenced while building the churn model. Kept for
  documentation/portfolio purposes; not part of the running app.

## Using it

1. From the business platform's landing page, sign up/sign in as a
   **Business**.
2. The business-owner dashboard now has four options instead of three:
   Previous Report, Import Data, Customer Reviews, and **Predict Churn**.
3. **Predict Churn** opens the churn form (13 customer features). Submitting
   it saves the record and shows the LightGBM model's prediction, and — if the
   customer is flagged as likely to churn — an "Explain Why" panel with the
   per-feature SHAP values (as text, increase/decrease risk), a LIME
   explanation plot, and the coupons/cashback the rewards model suggests to
   retain them. (`ml-service/predict.py` also returns a SHAP *graph* image;
   the UI intentionally doesn't render that one — text values + LIME plot only.)
4. The same page has an "Update Actual Outcome" panel: once you know what a
   customer actually did, record it there. Every mismatch between prediction
   and reality is logged; once 5 wrong predictions accumulate, the server
   kicks off `ml-service/retrain_with_rl.py`, which runs the Q-learning loop
   and retrains the churn/rewards models on the accumulated feedback — exactly
   as in the original standalone churn app.
5. **Previous Report** and **Import Data → Current Sales Report** embed Looker
   Studio dashboards. Until one is connected, both show a themed "not
   connected yet" placeholder instead of a broken iframe — see
   [Connecting Looker Studio](#connecting-looker-studio) below.

## Connecting Looker Studio

`Visualization.jsx` ("Previous Report") and `RecentVisualization.jsx`
("Current Sales Report") both render through one shared component,
[`LookerReport.jsx`](client/src/components/LookerReport.jsx), which reads its
embed URL from an env var instead of a hardcoded iframe `src`.

**Hard constraint to know going in:** Looker Studio runs in Google's cloud —
it can never reach `localhost`. So the "Current Sales Report" can't query
this app's database directly; it needs a bridge Google's servers *can* reach.
This app uses **Google Sheets** as that bridge (Looker Studio's
best-supported, free, native connector): every CSV import automatically
pushes that batch of rows to a Google Sheet via
[`server/services/sheetsSync.js`](server/services/sheetsSync.js), and Looker
Studio reads the Sheet, refreshing whenever the report is opened or manually
refreshed. That's the realistic meaning of "real-time" here — the data is
never stale by more than one import, but it's not an instant push.

### Pipeline for the full picture

```
CSV upload → multer saves file → csv-parser reads it → MongoDB (import_data,
full history, never cleared) → Google Sheets (this batch only, replaces
previous) → Looker Studio report (built once against that Sheet) → embedded
in RecentVisualization.jsx via VITE_LOOKER_STUDIO_CURRENT_REPORT_URL
```

The database write and the Sheets sync are decoupled on purpose: if Sheets
sync fails or isn't configured yet, the CSV import still succeeds and the
data is still safely in MongoDB — `/upload-csv/`'s response includes a
`sheetSync` field (`{ synced: true/false, reason }`) so you can tell which
happened. You can also trigger a resync without a new upload:
`POST /analytics/resync-current-sheet`.

### One-time setup: Current Sales Report (live)

1. **Create a Google Cloud project** at [console.cloud.google.com](https://console.cloud.google.com) →
   the project dropdown (top left) → **New Project** → name it (e.g.
   "insightgo") → Create.
2. **Enable the Sheets API**: with that project selected, go to **APIs & Services
   → Library**, search "Google Sheets API", click it, click **Enable**.
3. **Create a service account**: **APIs & Services → Credentials → Create
   Credentials → Service account**. Name it anything (e.g. "insightgo-sheets-sync").
   You can skip granting it project-level roles — access is granted per-Sheet
   in step 5 instead.
4. **Generate a key**: open the service account you just created → **Keys**
   tab → **Add Key → Create new key → JSON** → it downloads automatically.
   Move that file to `server/credentials/google-service-account.json` (the
   whole `server/credentials/` folder is gitignored — this key never gets
   committed).
5. **Create the target Google Sheet**: make a new blank Sheet at
   [sheets.google.com](https://sheets.google.com), name it anything, rename
   its first tab to `CurrentSalesData` (or pick your own name and set
   `GOOGLE_SHEET_TAB_NAME` to match). Click **Share**, and share it with the
   service account's email address (found on the service account's page,
   looks like `insightgo-sheets-sync@<project-id>.iam.gserviceaccount.com`) —
   give it **Editor** access.
6. **Copy the Sheet ID** from its URL —
   `https://docs.google.com/spreadsheets/d/`**`<THIS_PART>`**`/edit` — and set
   it in `server/.env`:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/google-service-account.json
   GOOGLE_SHEET_ID=<the id you just copied>
   GOOGLE_SHEET_TAB_NAME=CurrentSalesData
   ```
7. **Upload a CSV** through the business dashboard's "Import Data" — check the
   server log for `Sheets sync: wrote N rows to "CurrentSalesData".`, and
   confirm the rows actually appear in the Sheet.
8. **Build the Looker Studio report**: at [lookerstudio.google.com](https://lookerstudio.google.com),
   **Create → Report → Add data → Google Sheets** → pick that spreadsheet/tab
   → build whatever charts make sense for your columns (Sales by Region, a
   time trend, top categories, …).
9. **Embed it**: **File → Embed report** → enable embedding → copy the URL →
   set it in `client/.env`:
   ```
   VITE_LOOKER_STUDIO_CURRENT_REPORT_URL=<embed url>
   ```
   Also share the report itself as **"Anyone with the link can view"**
   (Share button, top right) — otherwise viewers hit Looker Studio's own
   "Can't access report, please sign in" wall regardless of the embed URL
   being correct.
10. Restart `npm run dev:client` (Vite only reads `.env` at startup).

From here on, every CSV import automatically refreshes the Sheet, and the
report shows the latest data next time it's opened/refreshed — no more manual
steps needed.

### One-time setup: Previous Report (premade)

This one's simpler since it's meant to be a static, pre-built snapshot, not
live data:

1. Build any report in Looker Studio (against a one-off CSV upload to Sheets,
   a sample dataset, whatever you want it to show).
2. **File → Embed report** → enable embedding → copy the URL.
3. Set it in `client/.env`:
   ```
   VITE_LOOKER_STUDIO_PREVIOUS_REPORT_URL=<embed url>
   ```
4. Share it as "Anyone with the link can view" too, same reason as above.

## Getting started

Prerequisites: Node 18+, Python 3.10+, a MongoDB instance (local or Atlas)
running on `mongodb://localhost:27017` (or update the `.env` files below).

Every command runs **from the `InsightGo/` project root** — `cd` into it first.

```bash
cd InsightGo

# 1. Install everything (creates ml-service/.venv and installs Python deps there —
#    macOS's Homebrew Python refuses global `pip install` (PEP 668), so ml-service
#    gets its own virtualenv instead of touching the system Python)
npm run install:all

# 2. Configure environment
cp server/.env.example server/.env        # already pre-filled locally
cp ml-service/.env.example ml-service/.env
# both MONGO_URI values must point at the SAME database — see Architecture above

# 3. Make sure MongoDB is running locally, e.g.:
mongod --config /opt/homebrew/etc/mongod.conf --fork

# 4. Run client + server + ml-service together
npm run dev
```

Or run each piece separately (three terminals):

```bash
npm run dev:ml       # Flask ML service on :5001
npm run dev:server   # Express API on :8000
npm run dev:client   # Vite dev server on :5173
```

## What changed vs. the original repos

Nothing about the models, preprocessing, SHAP/LIME explanations, or the
Q-learning retraining algorithm was touched. The only changes are wiring so
the two apps work as one:

- `ml-service/predict.py`: Flask port `5000 → 5001` (so it doesn't collide
  with the churn app's old Node "db" server port, which the main API now
  occupies), and the SHAP/LIME plot output folder is resolved relative to the
  file instead of two directories up.
- `ml-service/retrain_with_rl.py`: `.env` and `outputs/` paths made relative to
  the script's own location instead of assuming a `backend/db/.env` folder and
  a specific working directory — both were fragile even in the original repo.
- The churn app's standalone Node "db" server (`churn-app/db/server.js`) was
  ported into `server/controllers/churnController.js` + `server/routes/churnRoutes.js`,
  route-for-route identical, mounted at `/churn/*` on the shared Express API
  instead of running as its own process on its own port.
- `predict.py`/`retrain_with_rl.py` had the churn database name hardcoded as
  `client["churn_prediction"]`, ignoring `MONGO_URI`'s own path. Both now use
  `client.get_default_database()` so they read/write whatever database
  `MONGO_URI` actually points at — the same one `server/` uses. (Originally
  the churn app used a second, separate database; this repo consolidates
  everything — business data, CSV imports, reviews, and churn/RL tables —
  into one `insightgo` database, deliberately, since it's meant to run as one
  product.)
- The RL-retraining trigger's hardcoded Windows dev path
  (`D:\Churn-Prediction-Using-XAI\...`) is now a relative path into
  `ml-service/`.
- Both React frontends (the standalone churn-app CRA UI and the business
  platform's Vite UI) were consolidated into the business platform's UI/theme;
  the churn form + result screens are new components with the same fields,
  same API calls, same response fields — just styled to match the rest of the
  dashboard instead of introducing a second visual language.

## Tech stack

**Frontend:** React (Vite), React Router, Tailwind CSS, Axios
**Backend:** Node.js, Express, Mongoose, Google Sheets API (googleapis)
**ML service:** Python, Flask, LightGBM, SHAP, LIME, scikit-learn, Q-learning
**Database:** MongoDB (single shared database)
**BI:** Looker Studio, driven by an automated MongoDB → Google Sheets sync
**Techniques:** Ensemble learning (LightGBM), Explainable AI (SHAP, LIME),
Reinforcement Learning (Q-learning), CSV-driven business analytics

## Repository layout

```
InsightGo/
├── client/          React + Vite frontend (single themed UI)
├── server/          Express API
│   ├── controllers/  business/customer/CSV/reviews/churn/analytics logic
│   ├── services/      sheetsSync.js — pushes CSV imports to Google Sheets
│   ├── config/         googleSheets.js — service-account auth
│   └── credentials/    gitignored — your Google service-account key goes here
├── ml-service/       Flask ML microservice (model, SHAP/LIME, RL retraining)
├── research/        Dataset-prep notebooks, training notebook, reference papers
└── README.md
```
