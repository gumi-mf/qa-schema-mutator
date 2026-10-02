# API Schema Mutator & Dual-Target Test Synthesizer

> A client-side developer & QA automation tool that ingests a JSON Schema and sample API payload, applies user-selected edge-case mutation rules (boundary limits, null values, type mismatches, unicode/fuzz vectors), and automatically synthesizes both an exportable **Postman Collection (v2.1)** and a fully runnable **Playwright API Test Suite (`.spec.ts`)**.

## 🚀 Features

- **Schema & Payload AST Analysis**: Traverses JSON Schema (Draft-07 / 2020-12) to identify constraints, required fields, and types.
- **Client-Side Mutation Engine**:
  - 📏 **Boundary Limits**: Numeric min/max boundaries, off-by-one errors, string length overflows, array bounds.
  - 🚫 **Null & Omission**: Missing required attributes, explicit `null` injection, empty arrays/objects.
  - 🔀 **Type Mismatches**: Numeric vs string, boolean coercion traps, primitive vs object mismatches.
  - 🛡️ **Unicode & Security Fuzzing**: High-order emojis, RTL overrides, zero-width characters, SQLi, XSS, and path traversal vectors.
- **Dual-Target Code Compilation**:
  - **Postman Collection v2.1.0**: Hierarchical folders, pre-request scripts, parameterized variables, and automated `pm.test` assertions.
  - **Playwright API Test Suite (`.spec.ts`)**: Code-first TypeScript tests using `@playwright/test` `APIRequestContext` with built-in schema assertions.
- **Interactive Developer Experience**:
  - Monaco Editor for Schema, Payload, and generated code views.
  - Visual mutation matrix built with Tailwind CSS & shadcn/ui.
  - Live payload diff viewer.
  - In-browser simulated mock runner to verify tests on the fly.

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **UI & Components**: Tailwind CSS + shadcn/ui + Radix UI Primitives + Lucide Icons
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Schema Validation**: Ajv 8 + ajv-formats
- **Testing**: Vitest (Unit) + Playwright (API Test Target)
