# ChaiGPT

An AI chat assistant built with Next.js — streaming responses, a web-search tool the model can call on its own, and the ability to branch a conversation from any assistant message.

## Features

- **Streaming chat** powered by the [AI SDK](https://ai-sdk.dev) and Google Gemini.
- **Web search tool** — the model decides when it needs current information and calls a Tavily-backed `webSearch` tool mid-response.
- **Conversation branching** — fork a new conversation from any assistant message, keeping shared history up to that point.
- **Auth** via Clerk.
- **Persistence** via Postgres + Prisma.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [AI SDK](https://ai-sdk.dev) (`ai`, `@ai-sdk/google`, `@ai-sdk/react`)
- [Prisma](https://www.prisma.io) + Postgres
- [Clerk](https://clerk.com) for authentication
- [Tavily](https://tavily.com) for web search
- Tailwind CSS v4 + shadcn/ui components
- [Bun](https://bun.sh) as the package manager

## Prerequisites

- [Bun](https://bun.sh) installed
- A Postgres database (e.g. [Neon](https://neon.tech))
- API keys/accounts for [Clerk](https://dashboard.clerk.com), [Google AI Studio](https://aistudio.google.com/apikey), and [Tavily](https://app.tavily.com)

## Local development

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in `.env` with your own values — see [Environment variables](#environment-variables) below.

3. **Set up the database**

   ```bash
   bunx prisma migrate dev
   ```

   This applies the migrations in `prisma/migrations` and generates the Prisma client.

4. **Run the dev server**

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example` for the full list with links to where to get each key. In short:

| Variable | Used for |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk authentication |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Clerk sign-in/sign-up routing |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini model used for chat completions |
| `TAVILY_API_KEY` | The `webSearch` tool |

## Scripts

```bash
bun run dev     # start the dev server
bun run build   # production build
bun run start   # run the production build
bun run lint    # lint
bunx prisma migrate dev     # apply migrations locally
bunx prisma studio          # browse the database
```

## Project structure

```
app/                  Next.js App Router routes (auth pages, chat pages, /api/chat)
features/
  ai/                 model config, the webSearch tool, message persistence for the chat stream
  auth/                Clerk user helpers
  conversation/        conversation/branch server actions, hooks, and chat UI components
components/
  ai-elements/          streaming chat UI primitives (messages, tool calls, conversation scroll)
  ui/                    shadcn/ui components
  providers/             React Query + theme providers
prisma/                schema and migrations
```
