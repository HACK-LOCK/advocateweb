# Customer Management Portal for Advocates & Lawyers

A fast, lightweight, single-page SaaS web application designed for advocates and lawyers to record customer details, case/problem notes, and billing items.

## Features

- **Header**: Single line navigation with exactly three options: `New Customer`, `Customers`, and `Search`.
- **Customer List**: Compact, responsive grid showing customer name, date/time pill, phone number (or "No number added"), address, case/problem detail, bill items breakdown, and total.
- **Billing & Price Section**: A searchable item picker above the price list finds catalog items by name, category, or packaging text and lists them in natural alphabetical/numerical order. Selecting an item auto-fills its catalog price, shows its packaging and stock, and lets you change quantity or customize the price without extra setup.
- **Packaged Item Catalog**: Ships with the advocate counter-fee and notary packaging rules below. Prices are prefilled and editable; quantities are counted in sheets or 2-piece packs, while stock is tracked and deducted in pieces. Sheet/pack items with zero stock are blocked from selection, and the `+` button stops at available stock.
- **Stock Management**: A dedicated **Stock** section (from the left menu) shows remaining stock for each item, highlights low/out-of-stock items, lets you add stock to existing items or create a new item with initial stock, supports quick edits, and keeps a stock movement history (additions, sales deductions, manual adjustments/sets).
- **Stock & Units**: Each bill row shows whether it is sold per sheet, per 2-piece pack, or per piece. Saved customer cards and WhatsApp summaries keep the same unit wording (for example `Notary (₹900 Base) × 1 sheet`). Stock is tracked in pieces and deducted automatically when a customer bill is saved.
- **Top 3-dot Options Drawer**: A visible three-dot button in the top-right header opens a slide-out panel containing the Items & Prices manager, Price List, and Cloud Sync settings. Every item row keeps its own 3-dot menu with **Edit item**, **Customize price**, **Price history**, and **Delete item**.
- **Item Price History**: A dedicated history modal shows the current price, every recorded price change (old → new), and every past bill where the item was used.
- **Draft Safety**: Typing in the New Customer form is never lost when navigating to Customers, Search, or Price List. A "Draft saved" bar allows instant continuation until explicitly closed with `✕`.
- **Phone Reminder**: A one-time prompt ("Number is empty — Save anyway?") appears if no phone number is provided, allowing saving without blocking.
- **Direct Dial & WhatsApp**: Instant 1-tap phone dialing and pre-filled WhatsApp billing summary with full itemized breakdown (only when a phone number is provided).
- **Offline First**: Runs completely offline using browser `localStorage` out-of-the-box, with optional cloud sync to Supabase.
- **Speed & Lightness**: Uses system fonts only (zero external font downloads), single-request asset loading, debounced search (250ms), selective loading of bill items for displayed customers only, and 30–60 second in-memory caching.

---

Saving a bill deducts the matching pieces from stock: for example, one `Notary (₹900 Base)` sheet deducts 180 pieces, and one `Marriage Certificate / Stamp` pack deducts 2 pieces. Per-piece items without tracked stock remain unlimited.

---

> [!WARNING]
> **Data Storage Notice**: In offline mode, customer records and price items are saved exclusively in your browser's local storage (`localStorage`). This data lives only on that specific browser and device. To safeguard your customer records and access them across multiple devices, connect your Supabase database using the instructions below.

---

## Project Structure

```text
├── index.html            # Main single-page application entry point
├── css/
│   └── style.css         # Minimalist stylesheet with responsive styling
├── js/
│   ├── config.js         # Supabase connection placeholders & helper
│   ├── supabase.js       # Offline localStorage + Supabase REST data layer
│   └── app.js            # UI logic, keyboard flow, draft safety, WhatsApp generator
├── supabase/
│   └── schema.sql        # Supabase PostgreSQL schema and initial price items
├── README.md             # Project documentation
├── .env.example          # Environment variables reference template
└── .gitignore            # Git exclusion rules (ignores .env files)
```

---

## Running Locally

You can run this application locally without any build steps or package installations:

### Option 1: Direct File
Simply double-click or open `index.html` in any modern web browser.

### Option 2: Python Static Server
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

### Option 3: VS Code / IDE Live Server
Right-click `index.html` and choose **Open with Live Server**.

---

## Database Setup (Supabase)

To enable cloud synchronization across multiple devices and deployments:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of `supabase/schema.sql` (includes tables for customers, items, billing, and stock movement history).
4. Copy your **Project URL** and **anon public key** from `Settings -> API`.
5. Enter them either:
   - In `js/config.js` under `SUPABASE_URL` and `SUPABASE_ANON_KEY`, or
   - In the web app by opening the top-right three-dot menu and choosing **Cloud Sync (Supabase)**.

---

## Deployment on Render

This project is ready to deploy on Render as a **Static Site** (no build step, no server runtime).

### Option A: Blueprint (recommended)
1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New + -> Blueprint**.
3. Connect the repository — Render will read `render.yaml` and create the static site automatically.

### Option B: Manual Static Site
1. Push this repository to GitHub.
2. In Render, click **New + -> Static Site** and connect the repository.
3. Use these settings:
   - **Build Command**: *(leave empty)*
   - **Publish Directory**: `.` *(project root, where `index.html` is located)*
4. Click **Create Static Site**.

### Supabase (optional, for cloud sync)
The app works fully offline using browser `localStorage`. To enable multi-device sync:
- Create a Supabase project and run `supabase/schema.sql` in the SQL Editor (re-run it later to apply safe schema upgrades).
- In the deployed app, open the menu (top-left) → **Cloud Sync (Supabase)** and enter your **Project URL** and **anon public key** (from Supabase → Settings → API).

> **Note:** Do not commit real credentials. `.env` and Supabase local/link artifacts are gitignored; use `.env.example` as a template for local reference only.

---

## Keyboard Navigation

While creating a customer, pressing <kbd>Enter</kbd> moves through fields sequentially:
1. **Date** &rarr;
2. **Time** &rarr;
3. **Name** &rarr;
4. **Number** &rarr;
5. **Address** &rarr;
6. **Problem / Case detail** (Pressing <kbd>Enter</kbd> jumps directly to the Price Section; <kbd>Shift</kbd> + <kbd>Enter</kbd> adds a new line) &rarr;
7. **Price Section** &rarr;
8. **Save Customer**
