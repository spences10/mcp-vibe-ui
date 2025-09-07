MCP TypeScript Server (mcp-vibe-ui)

Overview

- Minimal Model Context Protocol server implemented in TypeScript
  using the official `@modelcontextprotocol/sdk`.
- Provides two example tools: `echo` and `ping` to validate
  connectivity.

Prerequisites

- Node.js 18.17+ recommended
- pnpm 9+ (via Corepack: `corepack enable`)

Install

- pnpm install

Develop

- pnpm dev

Build

- pnpm build

Run

- pnpm start

Formatting

- Configure Prettier via `.prettierrc` (tabs, single quotes, trailing
  commas, width 70, prose wrap always).
- Format all: `pnpm format` / Check: `pnpm format:check`

Releases (Changesets)

- Create changeset: `pnpm changeset`
- Version packages: `pnpm version-packages`
- Publish: `pnpm release`

Claude Desktop integration (example)

- Add an entry under your MCP servers configuration pointing to the
  built server: { "mcp-vibe-ui": { "command": "node", "args":
  ["/absolute/path/to/repo/dist/server.js"], "env": {} } }

Notes

- The server communicates via stdio transport, per official MCP docs.
- Extend by adding tools via `server.addTool` in `src/server.ts`.
