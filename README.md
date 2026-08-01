# SmartSpend Lite

**A personal finance dashboard that turns raw transactions into budgets, goals and plain-language insight.**

Built with the Next.js App Router, Firebase and NextAuth. Log expenses, set budgets and goals, and
get analytics on where the money actually went.

---

## Features

| | |
|:--|:--|
| **Dashboard** | Live spend overview with animated metrics and mini charts |
| **Transaction parsing** | `transactionParser.ts` turns unstructured transaction text into structured entries |
| **Budgets** | Per-category budgets with progress tracking |
| **Goal planner** | Set savings targets and track progress against them |
| **Analytics & insights** | Spend breakdowns and trend analysis over time |
| **Panic mode** | One-tap view for when you're over budget and need to see what to cut |
| **Transaction alerts** | Surfaces unusual or threshold-breaking activity |
| **Onboarding flow** | Guided first-run setup including monthly income capture |

## Tech Stack

`Next.js (App Router)` · `TypeScript` · `React` · `Firebase` · `NextAuth` · `Tailwind CSS`

## Architecture

```
app/
├── dashboard/      analytics/     insights/
├── budget/         goals/         monthly-income/
├── onboarding/     login/         profile/       settings/
├── api/auth/[...nextauth]/        # NextAuth route handler
├── components/
│   ├── enhanced/   # AnimatedMetric, MiniChart, PanicModeModal, QuickActions
│   ├── AddExpenseModal, GoalPlanner, TransactionAlerts
│   └── ErrorBoundary, LoadingSkeleton, StandardPageShell
└── lib/
    ├── auth.tsx              # session context
    ├── firebase.ts           # Firebase client
    ├── store.ts              # client state
    └── transactionParser.ts  # text -> structured transaction
```

Route groups each carry their own `layout.tsx`, so page shells and loading states are scoped per
section rather than bolted onto a single root layout.

## Getting Started

```bash
git clone https://github.com/lokeshtheprogrammer/smartspendlite.git
cd smartspendlite
npm install
```

Create `.env.local`:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=            # openssl rand -base64 32

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

```bash
npm run dev     # http://localhost:3000
```

## Deployment

Configured for Firebase Hosting via `.firebaserc`:

```bash
npm run build
firebase deploy
```

## Roadmap

- [ ] Bank statement (CSV / PDF) import
- [ ] Recurring transaction detection
- [ ] Multi-currency support

## License

MIT
