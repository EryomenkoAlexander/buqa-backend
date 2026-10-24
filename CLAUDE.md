# Buqa Backend — Project Instructions

## Project Context

This is the backend for **Buqa Terminal** — a diploma project on the topic "Разработка веб-терминала биржевой торговли" (Web terminal for stock exchange trading). The backend is a **thin proxy server** built with NestJS 12. Its sole responsibility is to forward requests from the Angular frontend to the Alpaca Paper Trading API, adding authentication headers from environment variables so API keys never reach the browser.

Frontend repository: `D:/projects/buqa-terminal` (Angular 22).

---

## Tech Stack

- **NestJS 12** — framework
- **TypeScript 6** — strict mode
- **Vitest** — testing
- **oxlint** — linting
- **ESM** (`"type": "module"` in package.json)

---

## TypeScript Best Practices

- Use strict type checking (`strict: true` already configured)
- Prefer type inference when the type is obvious
- Avoid `any`; use `unknown` when type is uncertain
- All functions must have **explicit return types**
- Annotate all fields explicitly — even when inference is obvious
- No path aliases — relative imports only

---

## NestJS Best Practices

- One module per domain feature (e.g. `OrdersModule`, `PositionsModule`)
- Controllers handle HTTP only — no business logic
- Services contain all business logic
- Use `@nestjs/config` for environment variables — never `process.env` directly in services (`npm i @nestjs/config`)
- Use `HttpModule` (`@nestjs/axios`) for outbound HTTP requests to Alpaca (`npm i @nestjs/axios axios`)
- Guards and interceptors are always classes (implementing `CanActivate` / `NestInterceptor`)
- Never use `any` in DTOs — define proper interfaces/classes
- `async/await` is fine in controllers and services

---

## Project Structure

```
src/
├── app.module.ts          # Root module
├── main.ts                # Bootstrap
└── modules/               # Feature modules
    └── feature/
        ├── feature.module.ts
        ├── feature.controller.ts
        ├── feature.service.ts
        ├── dto/
        │   ├── create-feature.dto.ts
        │   └── feature-response.dto.ts
        └── interfaces/
            └── feature.interface.ts
```

---

## Naming Conventions

### Files — kebab-case

| Artifact | Pattern |
|---|---|
| Module | `feature.module.ts` |
| Controller | `feature.controller.ts` |
| Service | `feature.service.ts` |
| DTO | `create-feature.dto.ts` |
| Interface | `feature.interface.ts` |
| Guard | `feature.guard.ts` |
| Interceptor | `feature.interceptor.ts` |

### Classes — PascalCase + suffix

`FeatureModule`, `FeatureController`, `FeatureService`, `CreateFeatureDto`, `FeatureInterface`

### Field Access Modifiers

```typescript
@Injectable()
export class FeatureService {
  // Private readonly — injected deps via constructor (with _ prefix)
  constructor(
    private readonly _http: HttpService,
    private readonly _config: ConfigService,
  ) {}

  // Public — service methods
  public getItems$(): Observable<ItemInterface[]> { ... }
  public async createItem(dto: CreateItemDto): Promise<ItemInterface> { ... }
}
```

- Private fields and methods: `_` prefix
- Injected dependencies: constructor injection, `private readonly` + `_` prefix

---

## Observable / RxJS

- `@nestjs/axios` returns `Observable` — use RxJS operators when working with it
- Observable-returning methods get `$` suffix: `getOrders$()`, `createOrder$()`
- `async/await` is also acceptable — use whichever fits the context
- Use `map`, `catchError`, `switchMap` from RxJS operators when using Observables

```typescript
// Observable style (with @nestjs/axios)
public getOrders$(): Observable<OrderInterface[]> {
  return this._http.get<OrderInterface[]>('/orders').pipe(
    map((response) => response.data),
    catchError((error: unknown) => throwError(() => error)),
  )
}

// async/await style (also fine)
public async getOrders(): Promise<OrderInterface[]> {
  const response = await firstValueFrom(this._http.get<OrderInterface[]>('/orders'))
  return response.data
}
```

---

## DTOs and Interfaces

- Since this is a proxy server, DTOs are minimal — plain TypeScript classes with typed fields, no `class-validator` needed
- Interfaces for Alpaca response shapes — preserve `snake_case` field names, no camelCase mapping
- DTOs for incoming Angular requests — typed classes, no decorators needed

```typescript
// Request DTO — from Angular frontend
export class CreateOrderDto {
  symbol: string
  qty: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop'
}

// Response interface — matches Alpaca API shape exactly
export interface OrderInterface {
  id: string
  client_order_id: string
  symbol: string
  qty: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop'
  status: string
  created_at: string
}
```

---

## Environment Variables

All secrets go in `.env` (gitignored). Access via `ConfigService` only.

```env
ALPACA_KEY=your_key_here
ALPACA_SECRET=your_secret_here
ALPACA_BASE_URL=https://paper-api.alpaca.markets/v2
ALPACA_DATA_URL=https://data.alpaca.markets/v2
PORT=3000
```

---

## CORS

Enable CORS in `main.ts` for the Angular dev server and production frontend URL:

```typescript
app.enableCors({
  origin: ['http://localhost:4200', 'https://buqa-terminal.vercel.app'],
})
```

---

## Git

### Commit format — Conventional Commits

```
feat: add OrdersController
fix: resolve null check in PositionsService
chore: update dependencies
refactor: extract alpaca http client
```

Types: `feat` | `fix` | `chore` | `refactor` | `docs` | `style` | `test`

### Branch naming

```
feature/short-description
fix/short-description
```

---

## What This Backend Does NOT Do

- No database
- No authentication (users don't log in here)
- No business logic beyond proxying
- No file uploads
- No WebSocket server (market data WebSocket is handled client-side directly with Alpaca)