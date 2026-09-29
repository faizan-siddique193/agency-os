# AgencyOS — Internal Development Tracker

**AgencyOS** is a B2B SaaS platform serving as the central operations engine for modern agencies. It handles project management, client portals, financial tracking, and team collaboration inside isolated, multi-tenant workspaces.

> **Note to Developers / AI Agents**: This README is the source of truth for our architectural standards, design patterns, and MVP module progress. **Read this before writing any new code.**

---

## 🏗️ Architectural Guidelines & Patterns

To maintain a clean, secure, and production-ready codebase, we strictly follow these patterns:

### 1. Folder Structure (Feature-Driven)
All business logic is grouped by domain inside `src/features/`. Do not pollute the global `components/` or `lib/` folders with domain-specific code.
```text
src/features/<domain-name>/
├── action/      # Server actions (e.g., create-client.ts)
├── component/   # React components (e.g., ClientTable.tsx)
├── schema/      # Zod validation schemas
└── seed/        # Database seeding scripts for the domain
```

### 2. Server Action Rules (Security First)
Every server action must follow this exact sequence:
1. **Validate Input**: Use `zod.safeParse()` on the raw payload.
2. **Tenant Context**: Await `getTenantContext(slug)` to verify the user belongs to the workspace.
3. **Permission Check**: Call `hasGlobalPermission(tenant.membership.role, 'resource:action')` to enforce PBAC.
4. **Ownership Check**: If mutating an existing record, verify `record.workspaceId === tenant.workspace.id`.
5. **Cache Invalidation**: Call `revalidatePath()` upon success.
6. **Error Handling**: Return `{ success: false, error: string }` instead of throwing unhandled exceptions.

### 3. 🔐 Tenant Isolation & Multi-Tenancy Architecture
*   **Data Partitioning:** Every query executed via Prisma must append the `workspaceId` derived from `getTenantContext()`.
*   **Row-Level Enforcement:** Do not pass unverified tenant structural parameters from client-side forms. Always resolve ownership on the server layout using the active session token.

### 4. Database Patterns (Prisma)
- **IDs**: Always use `@default(cuid())` for primary keys.
- **Multi-Tenancy**: Every business entity (Project, Client, Task) MUST have a `workspaceId` with a relation to the `Workspace` model.
- **Financials**: All monetary values (e.g., `budget`) must be stored as `Int` (cents) to avoid floating-point math errors.
- **Deletion**: Use `onDelete: Cascade` carefully. Prefer soft-deletes (`deletedAt DateTime?`) for critical records like Projects and Invoices.

### 5. UI & Styling
- **Aesthetics**: Use Tailwind CSS, Lucide Icons, and `shadcn/ui`.
- **Forms**: Use `react-hook-form` integrated with `@hookform/resolvers/zod`. Wrap inputs in the custom `<Field>` component for consistent label and error state styling.

---

## 🚀 MVP Roadmap (M1 - M8)

Tracking our progress against the complete MVP feature specification.

### [✅] Module 1: Authentication & Workspace Management
- [x] Multi-tenant workspace creation (Data isolation).
- [x] Role-based access control (Admin, Member, Freelancer, Client).
- [x] Standard Login (Email + Password via Auth.js / NextAuth).
- [x] Magic Link Invites (Tokenized).

### [✅] Module 2: Client Management
- [x] Client Profiles & Central Directory.
- [x] Project Linking (assign project to a client).
- [x] Client Status Tracking (computed Active/Paused states).
- [x] Client-Level Summaries (Project history per client).

### [🔄] Module 3: Project & Task Management
- [x] Project Creation (Flat project spaces, hour budgets, due dates).
- [ ] Task Creation & Assignment (Strict single-assignee).
- [ ] 5-Stage Kanban Board & List View Toggle.
- [ ] Task Context (Comments & S3-backed attachments).
- [ ] Client Visibility Toggle on tasks.

### [ ] Module 4: Team & Freelancer Management
- [ ] Centralized Directory & Active task loads.
- [ ] Scoped Project Assignment (Hiding the rest of the workspace).
- [ ] Freelancer Portal (Restricted view, no financials).
- [ ] One-Click Offboarding.
- [ ] Personal Dashboard ("My Tasks").

### [ ] Module 5: The Client Portal
- [ ] Branded Dashboard via magic link.
- [ ] Approval Workflow (Approve / Request Revision).
- [ ] File Handoff (Permanent download section).
- [ ] Audit Log (PDF-exportable).
- [ ] PM Notifications on client activity.

### [ ] Module 6: Scope & Financial Tracking
- [ ] Time Logging (Task card, billable/non-billable).
- [ ] Budget Burn Bar (Live visual tracker).
- [ ] 80% Budget Alert.
- [ ] Scope Change Logging.
- [ ] Profitability Summary.

### [ ] Module 7: Notifications & Workflow Triggers
- [ ] In-App Feed.
- [ ] Automated Triggers (Client review alerts, approval alerts).
- [ ] Daily Digest Emails.

### [ ] Module 8: Subscription & Billing
- [ ] Database Gating (SubscriptionTier).
- [ ] Stripe Integration (Checkout, webhooks, Customer Portal).
- [ ] Server-Side Middleware & Upgrade Prompts.
- [ ] 14-Day Trial Logic (Downgrades via cron).

---

## 💻 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file at the root:
```env
# Neon PostgreSQL Database URL
DATABASE_URL="postgresql://user:password@host/dbname?schema=public"

# Auth setup (NextAuth/Auth.js)
AUTH_SECRET="your-secret-here"
```

### 3. Database Sync & Seeding
```bash
# Push schema to database
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed initial roles, workspaces, and test data
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

---
*Keep this document updated as architectural decisions evolve and new MVP modules are completed.*
