# AI-Assisted Development for a Cricket Tournament Web App: Skills, Tools, and Workflow

**Executive Summary:** Implementing the Cricket Tournament PRD with AI “white coding” requires a combination of modern web-development skills (React, CSS frameworks, database design, authentication, etc.) and *AI-assisted meta-skills* (prompt engineering, system design, code review). Frontend work (registration forms, dashboards) uses React components styled with Tailwind CSS【29†L293-L301】【39†L133-L139】, often accelerated by a component library like shadcn/ui (“thousands of production-ready blocks…designed for AI-assisted React and Tailwind development”【31†L22-L26】). Forms are built with React Hook Form (for low-overhead, hook-based form handling) and validated with Zod schemas【23†L184-L193】【54†L59-L66】. State is managed with a lightweight store like **Zustand** (a “small, fast and scalable bearbones” state-manager with a simple hook-based API【27†L317-L325】). 

On the backend, **Supabase** (PostgreSQL+Auth) provides the database and API. You must design tables (teams, matches, notifications, settings, etc.) and implement row-level security so each team only sees its data【50†L200-L208】. Supabase Auth handles the login flow (for example, mobile+password or magic links)【34†L127-L135】, and can integrate with Realtime or serverless functions to send notifications or recalc the points table on score entry. For deployment, standard DevOps tools apply: version control on GitHub with automated CI/CD, and hosting on Vercel (which “detects React and enables zero-configuration” deployments【41†L31-L39】【41†L47-L51】). 

Throughout, AI agents are used smartly: **Codex (VS Code/Copilot)** is invoked for concrete coding tasks (writing a React form component, a Supabase query, or a unit test), while **Gemini/Antigravity** is used for higher-level planning (architectural diagrams, database schema, data flow). As one expert notes, the AI-assisted workflow becomes: *“Frame the problem → Describe intent → Review output → Correct direction → Integrate.”* In this model, *developers define *what* is needed and use AI to fill mechanical details, continually reviewing correctness【48†L69-L77】【48†L74-L77】.*  

The sections below map each feature/workflow of the PRD to the necessary skills, tools, difficulty, and resources, and outline an AI-guided implementation plan.

## Required Technical Skills and Tools

- **Web Fundamentals (HTML, CSS, JS)**: Proficiency in HTML, CSS, and modern JavaScript (ES6+) is essential. React lets you combine markup, styles and logic into reusable components【39†L133-L139】. You should also be comfortable with JSX and tooling (Vite, npm).  
- **React & Component Library**: Use React for all UI. Official React docs explain building components and managing state【39†L133-L139】. To speed up UI, use a component library (e.g. [shadcn/ui](https://shadcn.io) provides “thousands of production-ready…components…for AI-assisted React/Tailwind”【31†L22-L26】). Difficulty: **Medium**.  
- **Styling (Tailwind CSS)**: Tailwind’s utility-first approach avoids custom CSS. Official docs show using pre-built classes in HTML to style elements【29†L293-L301】. For example, a card can be created purely with utility classes (`p-6 bg-white rounded-xl shadow-md flex…`)【29†L293-L301】. Difficulty: **Easy-to-Medium**.  
- **State Management (Zustand)**: For global state (e.g. user session, notification count), use Zustand. It is “a small, fast…and scalable state-management solution” with a hook-based API【27†L317-L325】. No boilerplate or providers needed; state is updated immutably. Difficulty: **Medium**.  
- **Form Handling (React Hook Form + Zod)**: Registration and login forms require client-side validation. React Hook Form (RHF) is a lightweight form library that minimizes re-renders and integrates well with validation libraries【23†L184-L193】. Zod is a TypeScript-first schema validator that can define constraints (e.g. team name required, numeric fields) and auto-generate TS types【54†L59-L66】【23†L184-L193】. Combined (using a RHF–Zod resolver), they enforce form validity with minimal code. Difficulty: **Medium**.  
- **Authentication (Supabase Auth)**: Secure login requires understanding authentication flows. Supabase Auth provides password/magic-link/OTP and issues JWT tokens【34†L127-L135】. It stores users in your Postgres database and works with Row-Level Security (RLS) to restrict data access. You must enable RLS on your tables and write policies so, for example, a team sees only its own rows【50†L200-L208】. Difficulty: **High**. Key resource: Supabase Auth docs【34†L127-L135】.  
- **Database Design (PostgreSQL + RLS)**: Knowledge of SQL is needed to design tables (teams, matches, notifications, settings). The PRD schema is relational: *teams* and *matches* tables are linked (each match has two team IDs), and *points table* can be computed via queries or triggers. Supabase docs explain enabling RLS for secure access, e.g.: *“RLS is incredibly powerful…allowing you to write complex SQL rules...RLS can be combined with Supabase Auth for end-to-end user security”*【50†L200-L208】. You may write Supabase functions or use client SDKs for CRUD. Difficulty: **High**.  
- **Dashboard & Tables (Admin & User Views)**: Skills in building data-driven UIs – tables, charts, cards. The PRD requires showing counts and lists (e.g. recent registrations, points table). Use React components and UI elements (e.g. shadcn blocks for data tables). Fetch data via Supabase client or REST. Use libraries like *react-table* or charts only if needed. Difficulty: **Medium**.  
- **Real-time / Notifications**: (Optional) To implement the notification bell, either poll Supabase or use its realtime subscriptions. Supabase can broadcast DB changes via Realtime API (websockets). Otherwise, fetch the notifications table on page load. Difficulty: **Medium**.  
- **Testing (Jest + React Testing Library)**: Write unit/integration tests for critical components. The [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) “is a very light-weight solution for testing React components” that encourages tests simulating user behavior【52†L104-L112】. Use Jest as test runner. For example, after coding a login form, prompt Codex: *“Write a React Testing Library test for the LoginForm that checks error on bad credentials.”* Difficulty: **Medium**.  
- **Version Control & Deployment (GitHub + Vercel)**: Use Git/GitHub for source control. Commit logically, write clear messages. Connect the repo to Vercel for automatic deploys: Vercel “has integrations for GitHub…to enable CI/CD…with zero configuration”【41†L47-L51】. In Vercel, set environment variables (Supabase URLs/keys) via the dashboard – these are encrypted and scoped per environment【43†L1715-L1723】. Difficulty: **Easy**. The [Vercel docs](https://vercel.com/docs/cli) show “zero config” React deployments【41†L31-L39】.  

**Table: Key Tools and Libraries**  

| **Tool/Library**       | **Use-Case**                          | **Difficulty** | **Official Source (for docs)**               |
|-----------------------|--------------------------------------|---------------|---------------------------------------------|
| **React**             | Frontend UI library (components)     | Medium        | React docs【39†L133-L139】                  |
| **Vite**              | Build tool (dev server, bundling)    | Easy-Med      | Vite docs (Getting Started)                |
| **Tailwind CSS**      | Utility-first CSS framework          | Easy          | Tailwind docs【29†L293-L301】              |
| **shadcn/ui**         | Pre-built React+Tailwind components  | Easy          | shadcn.io site【31†L22-L26】               |
| **Zustand**           | State management (React hooks store) | Medium        | Zustand GitHub【27†L317-L325】             |
| **React Hook Form**   | Form state & validation             | Medium        | RHF docs (see Contentful blog)【23†L184-L193】 |
| **Zod**               | Schema validation (TS-first)         | Medium        | Zod docs【54†L59-L66】                   |
| **Supabase**          | Backend (Postgres DB + Auth + API)   | Medium-High   | Supabase Auth docs【34†L127-L135】         |
| **React Testing Library** | Testing React components         | Medium        | RTL docs【52†L104-L112】                   |
| **Jest**              | Test runner                          | Easy          | Jest docs (jestjs.io)                     |
| **Git/GitHub**        | Version control & CI/CD              | Easy          | GitHub docs; Vercel Git Integration【41†L47-L51】 |
| **Vercel**            | Hosting & CI/CD for frontends        | Easy          | Vercel docs【41†L31-L39】【41†L47-L51】     |
| **OpenAI Codex**      | AI code generation (in VSCode/Cursor) | N/A         | OpenAI Codex guide【10†L590-L598】        |
| **Gemini/Antigravity** | AI reasoning & planning             | N/A          | Mohsen Nasiri (Medium)【48†L69-L77】【48†L173-L182】 |
| **React Router (optional)** | Client-side routing (pages)   | Medium        | React Router docs                        |

## Feature Mapping: Skills and Tools

Below each key feature from the PRD is mapped to the needed skills, libraries, tasks, and difficulty:

- **Team Registration (Public):**  
  - *Skills:* React component development, form design, client-side validation.  
  - *Tools:* React + Tailwind to build the form UI; React Hook Form for form state; Zod for schema (e.g. `{ name: z.string().min(1), captain: z.string(), mobile: z.string().min(10) }`). Use Supabase client (`create('teams', {...})`) to submit.  
  - *Tasks:* Create form fields as per PRD; add real-time validation (required fields, check duplicates via an API call); on submit, clear form and show success banner.  
  - *Why:* Critical for collecting team data; UX-quality form is key.  
  - *Difficulty:* Medium (integrating multiple libs; some error handling).  
  - *Resources:* React docs on forms (e.g. controlling inputs)【39†L133-L139】; RHF docs; Zod introduction【54†L59-L66】; Tailwind usage【29†L293-L301】.  

- **Registration Approval Flow (Admin):**  
  - *Skills:* Database schema design (team status field), updating records, sending notifications.  
  - *Tools:* Supabase (update `teams.status`), Email/WhatsApp API (for automated messages) or manual scripts. Possibly use Supabase Functions/Triggers (database functions) to handle notifications.  
  - *Tasks:* Admin interface to view pending teams, click “Approve/Reject”. On approve: update status to “approved”, generate login (e.g. random password), send message. On reject: mark “rejected”, send polite email. Possibly update a `notifications` table.  
  - *Why:* Manual workflow but must be reliable and auditable.  
  - *Difficulty:* High (requires DB updates, external messaging).  
  - *Resources:* Supabase documentation on updates and functions; [Supabase Docs - Data API](https://supabase.com/docs/reference/javascript/insert) for CRUD.  

- **Authentication (Public Login & Admin Login):**  
  - *Skills:* User auth flow, protected routes.  
  - *Tools:* Supabase Auth (for team login); Admin login can be hardcoded or use Supabase Auth as well (e.g. Admin user in same auth table with role). Use React Router or conditional rendering to protect pages.  
  - *Tasks:* Create login form (mobile+password or email+password). On submit, call `supabase.auth.signInWithPassword()`. Handle errors (invalid/pending status). If success, store JWT and redirect to Dashboard. For admin, a separate login page and protected admin routes.  
  - *Why:* Security requires correct implementation; using Supabase Auth simplifies storing users and tokens.  
  - *Difficulty:* Medium-High.  
  - *Resources:* Supabase Auth docs【34†L127-L135】 (password-based auth guide); React Router (login redirect).  

- **Team Dashboard (Protected):**  
  - *Skills:* Dynamic data display, conditional rendering.  
  - *Tools:* React for UI (cards, lists); Supabase client to fetch scores, schedule, points. Possibly use Zustand store or React context to hold team info.  
  - *Tasks:* Query Supabase for the logged-in team’s stats (points, NRR, matches played, etc.) and next match. Display in cards. If no upcoming match, show placeholder. Refresh data on load.  
  - *Why:* Core user feature; must reflect latest data.  
  - *Difficulty:* Medium.  
  - *Resources:* Supabase JS reference; React useEffect for data fetching.  

- **Full Schedule & Results (Protected):**  
  - *Skills:* Rendering lists, filtering.  
  - *Tools:* React (table or list), Zustand for filter state (selected team filter).  
  - *Tasks:* Fetch all matches sorted by date. Provide UI to filter by team or view all. For completed matches, highlight the winner. Show scores or “vs” if pending.  
  - *Difficulty:* Medium.  
  - *Resources:* React list rendering; conditional classnames (Tailwind) for highlighting.  

- **Points Table (Protected):**  
  - *Skills:* Data computation, table display.  
  - *Tools:* Supabase (SQL query or function to compute points and NRR), React for UI. Could use `supabase.rpc()` with a SQL function that calculates points from match results. Or do it in frontend (pull match data, compute in JS).  
  - *Tasks:* Compute each team’s played/won/lost/tied, points, NRR. Display in a sortable table. (Optionally allow admin to override via Admin UI).  
  - *Difficulty:* High (algorithmic).  
  - *Resources:* PostgreSQL window functions (for points) or a blog on cricket points calculation.  

- **Match Scheduling (Admin):**  
  - *Skills:* Form with relational selects, date/time handling.  
  - *Tools:* React + Tailwind for the form; Supabase to insert into `matches` table. Use a date-picker component (or HTML datetime-local). For listing: React table.  
  - *Tasks:* Admin selects Team A, Team B (dropdowns from `teams`), picks datetime and venue, clicks Save. Data is stored. Below, show all scheduled matches (with status column).  
  - *Difficulty:* Medium.  
  - *Resources:* Supabase insert API; React form libraries; possible use of [Day.js or date-fns] for formatting.  

- **Score & Result Entry (Admin):**  
  - *Skills:* Updating relational data, triggers.  
  - *Tools:* React form to input score details; Supabase to update `matches` row (scores and status). Use Supabase Functions or backend code to recalc points: either write a Postgres trigger (PL/pgSQL) or do it in frontend by updating a `points` table.  
  - *Tasks:* On match complete, admin enters runs/wickets (both teams), clicks Save. Update match status to “complete”. Recompute points table (via SQL or app logic). Send notifications to teams about result (insert into notifications table or trigger email).  
  - *Difficulty:* High.  
  - *Resources:* Supabase Triggers (see [RLS doc](https://supabase.com/docs/guides/database/triggers) or example triggers); OpenAI Codex to generate the SQL trigger code (e.g. *“Create a Postgres trigger to update the points table after inserting a match result.”*).  

- **Tournament Overview (Admin):**  
  - *Skills:* Aggregation queries, dashboard stats.  
  - *Tools:* React dashboard (cards + tables); SQL queries for summaries.  
  - *Tasks:* Query total registrations, pending count, approved count, etc. Display as clickable cards (e.g. Pending Teams). Show quick tables (upcoming vs completed match counts). Possibly allow editing of points (if manual override).  
  - *Difficulty:* Medium.  
  - *Resources:* SQL `COUNT()` queries; React UI for cards.  

- **Notifications & Messaging (Admin and User):**  
  - *Skills:* CRUD on a notifications table, filtering by user, UI for messages.  
  - *Tools:* Supabase (`notifications` table); React form for sending messages; Zustand or state for notification list.  
  - *Tasks:* Admin composes a message (with optional “send to all” flag). On submit, insert into `notifications`. In user UI, fetch and display these (either on page load or via realtime subscription). Implement a bell icon with unread count (can store a read flag or simply check timestamps). Also a history table for admin showing past notifications.  
  - *Difficulty:* Medium.  
  - *Resources:* Supabase docs on insert/select; React lists.  

- **Deployment & DevOps:**  
  - *Skills:* Git workflows, CI/CD, environment config.  
  - *Tools:* GitHub (repo, code reviews), Vercel (hosting).  
  - *Tasks:* Push code to GitHub. Connect repo to Vercel – it auto-detects React and builds【41†L73-L82】. Set environment variables (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in Vercel dashboard【43†L1715-L1723】. Ensure `main` branch deploys to production; feature branches to preview. Run linting/tests as part of CI (could use GitHub Actions or Vercel’s built-in CI【41†L47-L51】).  
  - *Difficulty:* Easy.  
  - *Resources:* Vercel guides【41†L31-L39】【41†L47-L51】; GitHub Actions docs.  

## Meta-Skills for AI-Assisted Coding

Implementing with AI also demands specific *meta-skills* beyond pure coding:

- **Prompt Engineering:** Crafting precise prompts is crucial. As one blogger notes, “AI models respond differently depending on how instructions are written. A poorly written prompt produces weak results”【46†L67-L75】. For example, instead of “Add a user”, one might prompt:  
  ```
  // Codex prompt example:
  // "Write a React component `TeamForm` using React Hook Form and Zod. It should have input fields for Team Name, Captain Name, Mobile Number, validate required fields, and display inline errors."
  ```  
  Clear instructions about libraries and field names are needed. Difficulty: **Medium** (need iteration). Resources: OpenAI’s [Codex prompt guide【10†L590-L598】](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide) and blogs on prompt engineering.  

- **System Design & Architecture:** The developer must design the overall architecture. AI assists more with local code, while the human frames system constraints. As Mohsen Nasiri explains, the flow becomes *“Frame the problem → Describe intent → Review output → Correct direction → Integrate.”* You no longer script every line; you define the goal and trust AI to fill gaps【48†L69-L77】. In practice, use Antigravity prompts to outline the data schema or app architecture:  
  ```
  // Antigravity prompt example:
  // "Design a database schema (tables and fields) for a cricket tournament app. Include tables for teams, matches, notifications, and any relationships."
  ```  
  AI can suggest schema layouts, but you must verify cardinalities and constraints. Difficulty: **High** (requires deep understanding).  

- **Debugging and Validation:** AI-generated code often contains bugs or omissions. You must carefully **review** and test every AI suggestion. The role shifts to being an *“AI code reviewer”* – checking logic, edge cases, and security (especially important when AI writes auth code). Use tests and linters. Nasiri warns: “When AI generates entire chunks of logic, mistakes become systemic… seniority matters more”【48†L133-L142】. Keep a “bias for action”: have AI generate code, then iterate on fixes.  

- **Code Reading & Integration:** You need to read and adapt AI output into your project. This demands good knowledge of your codebase and the libraries used. For example, if Codex generates a component, ensure its styling and naming fit existing patterns【10†L611-L619】. Use AI iteratively: ask follow-up prompts to refine.  

- **Version Control and Collaboration:** Even with AI, use standard practices: small commits, pull requests, and code reviews (AI can generate diffs or summaries). The AI can help write commit messages or summary, but you must verify accuracy. Document any AI “assumptions” or changes.  

- **Time Management:** Leverage AI to expedite boilerplate work (writing components, queries, tests), but budget time for review and testing. A phased timeline might estimate 1–2 days for schema/auth, 2–4 days for user features, 3–5 days for admin features, plus 1–2 days for testing and deployment. (Adjust based on team size and expertise.) 

**Comparing AI Coding Tools:**  
| **AI Tool**                | **Role & Strengths**                                    | **Use-Case**                                                 |
|----------------------------|---------------------------------------------------------|--------------------------------------------------------------|
| **Codex (VSCode/GitHub Copilot)** | In-editor code completion; works “inside your editor, close to the code”【48†L90-L99】. Best for precise, localized tasks (writing a component function, query, or test). Maintains tight feedback loop – errors are obvious immediately【48†L96-L100】. | Use for scaffolding React components, hooks, Supabase queries, or writing unit tests. Works well when *you* know roughly what is needed (e.g. form fields).【48†L173-L181】【46†L67-L75】 |
| **Gemini/Antigravity**     | High-level reasoning assistant. Acts like a collaborator on architecture【48†L110-L118】. Excels at cross-file or system design and explaining tradeoffs. However, it may produce conceptually plausible but incorrect suggestions if unchecked【48†L118-L126】. | Use for planning: e.g. *“How should I structure the entire data schema for this tournament app?”* or *“Outline the React component hierarchy and data flow.”* Good for initial system design before coding. |

## Example AI Prompts

Here are sample prompts (to Codex or Antigravity) for common tasks:

- **UI Component Generation:**  
  ```
  // Prompt (Codex): 
  // "Generate a React functional component `<TeamRegistrationForm>` using React Hook Form and Tailwind CSS. It should have fields: Team Name, Captain Name, Mobile Number, and a Submit button. Use Zod for validation (all fields required). On submit, call a function 'submitRegistration'."
  ```  
- **Supabase Database Query:**  
  ```
  // Prompt (Codex): 
  // "Write a JavaScript function using Supabase JS SDK that fetches upcoming matches for a given team ID. It should call supabase.from('matches').select('*') with appropriate filters for that team and date >= now."
  ```  
- **Authentication Flow Code:**  
  ```
  // Prompt (Codex): 
  // "Write a React hook (useAuth) using Supabase that handles user login with mobile and password. It should export `login(mobile, password)` and `logout()` methods, storing the session token in local state."
  ```  
- **Unit Test Generation:**  
  ```
  // Prompt (Codex): 
  // "Write a Jest test (using React Testing Library) for the `LoginForm` component. It should simulate entering a wrong password and check that the error message 'Invalid credentials' is displayed."
  ```  
- **Database Trigger (SQL):**  
  ```
  // Prompt (Codex/Antigravity): 
  // "Write a PostgreSQL trigger function that updates a 'points_table' whenever a new row is inserted into the 'matches' table. It should increment wins/losses for the teams based on the inserted score."
  ```  

*(These prompts are templates – you would fill in details from your codebase. Codex will generate code snippets or SQL, which you must then verify.)* 

## AI-Assisted Workflow (Phases & Timing)

A typical AI-accelerated implementation plan might be:

1. **Planning & Schema (1-2 days):** Sketch the DB schema (teams, matches, etc.). Use Antigravity to review and refine (e.g. “What columns should `teams` have?”). Create a new Supabase project, define tables, enable RLS policies. Set up Supabase Auth settings (password rules). Estimate: *4–8 hours.*  

2. **Public Pages (2-3 days):**  
   - **Landing Page:** Build static sections (tournament info, rules) with HTML/CSS (Tailwind). AI can suggest layout markup if needed.  
   - **Registration Page:** Use Codex prompts to scaffold the form component. Integrate RHF and Zod. Test validation.  
   - **Login Page:** Similarly scaffold a simple login form. Add forgot-password info text.  
   Estimate: *8–12 hours.*  

3. **User Features (1-2 days):**  
   - **Dashboard:** Codex can generate React code to display cards. Write Supabase queries for stats. Test with mock data.  
   - **Schedule & Points Pages:** Use prompts to create the match list and points table components. Ensure data queries are correct.  
   Estimate: *8–16 hours.*  

4. **Admin Panel (3-5 days):**  
   - **Admin Login:** Simple login component. Hardcode an admin account or use Supabase role.  
   - **Team Management (Approve/Reject):** AI can generate the table UI. Implement click handlers to call Supabase update.  
   - **Match Scheduler:** Form and table generation via Codex.  
   - **Score Entry:** Use Codex to create score-entry form; write the logic to update matches. Possibly ask AI to update points (or implement a trigger).  
   - **Overview & Stats:** Create dashboard cards and tables for stats.  
   Estimate: *24–40 hours.*  

5. **Notifications & Messaging (1-2 days):**  
   - **Admin Messaging:** UI to compose and insert notifications (AI can scaffold form).  
   - **User Notifications:** On login, fetch new messages. Possibly subscribe to realtime updates with Supabase.  
   Estimate: *8–16 hours.*  

6. **Testing & Deployment (1-2 days):**  
   - Write unit/integration tests (AI can generate basic tests).  
   - Perform end-to-end manual QA (check flows, fix AI mistakes).  
   - Connect GitHub repo and Vercel, configure env vars【41†L47-L51】【43†L1715-L1723】.  
   - Deploy and finalize.  
   Estimate: *8–16 hours.*  

*(Time estimates are rough; actual may vary. The use of Codex/Antigravity typically speeds up coding, but leave ample time for AI review and testing.)*

## Diagrams

**Data Schema (Mermaid ER Diagram):**

```mermaid
erDiagram
    TEAMS {
      int id PK
      string name
      string captain
      string mobile
      string status   /* e.g. pending/approved/rejected */
      int points
      float nrr
    }
    MATCHES {
      int id PK
      int team1_id FK
      int team2_id FK
      datetime match_date
      string venue
      int score1
      int score2
      string status  /* upcoming/complete */
    }
    NOTIFICATIONS {
      int id PK
      int team_id FK  /* 0 for broadcast */
      text message
      timestamp sent_at
    }
    SETTINGS {
      boolean registration_open
    }
    TEAMS ||--o{ MATCHES : plays_in
    TEAMS ||--o{ NOTIFICATIONS : receives
```

**Workflow Flowchart (Mermaid):**

```mermaid
flowchart LR
  subgraph User
    A[Landing Page (Info)] --> B[Register Form]
    B --> C[Registration Submitted (Pending)]
    C -->|Approved| D[Team Login]
    C -->|Rejected| X[Show Rejection Message]
    D --> E[Team Dashboard]
    E --> F[Full Schedule & Results]
    E --> G[Points Table]
  end
  subgraph Admin
    I[Admin Login] --> J[Admin Dashboard]
    J --> K[Registrations List (Pending Teams)]
    K -->|Approve/Reject| L[Update Team Status + Notify]
    J --> M[Match Scheduler]
    M --> N[List of Matches]
    N -->|Schedule/Select| O[Score & Results Entry]
    J --> P[Tournament Overview (Points Table, Stats)]
    J --> Q[Send Notifications]
    Q --> R[Notifications History]
  end
  X --> J
  L --> D
  O --> E
```

## Checklist of Skills, Tools, and Resources

- **Full-Stack Web Development:** JavaScript, React, CSS (Tailwind) (React docs【39†L133-L139】, Tailwind docs【29†L293-L301】).  
- **Frontend Libraries:** React (components/JSX), Zustand (state)【27†L317-L325】, React Hook Form (forms)【23†L184-L193】, Zod (validation)【54†L59-L66】, shadcn/ui (UI kit)【31†L22-L26】.  
- **Backend/BaaS:** Supabase (Postgres, Auth, Realtime)【34†L127-L135】【50†L200-L208】, SQL (schema design, RLS).  
- **Authentication:** Password-based login (Supabase Auth guide【34†L127-L135】); understanding of JWT/RLS【50†L200-L208】.  
- **DevOps:** Git/GitHub, Vercel deployment (CI/CD)【41†L47-L51】, environment variables【43†L1715-L1723】.  
- **AI Skills:** Prompt engineering (Craft clear prompts【46†L67-L75】), using Codex vs Antigravity appropriately【48†L69-L77】【48†L173-L182】, iterative review and debugging.  
- **Testing:** Jest + React Testing Library【52†L104-L112】 (write and refine tests for each component).  

By combining these skills/tools and using AI tools judiciously (prompting Codex for code snippets and Antigravity for design), a developer can efficiently implement all PRD features. Official documentation for each technology (React, Tailwind, Supabase, etc.) and AI-guides (OpenAI Codex docs, AI development blogs) should be primary study resources. A disciplined workflow of “prompt → generate → review → test → integrate” will help ensure high-quality results.