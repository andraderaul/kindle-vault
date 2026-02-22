# Guia Prático — Problemas Comuns com Prisma + SQLite

Problemas reais encontrados em desenvolvimento, com causa e fix direto.

---

## 1. `The table does not exist in the current database`

```
PrismaClientKnownRequestError: The table `main.Highlight` does not exist
code: 'P2021'
```

**Causa:** o banco existe mas a migration nunca foi rodada — as tabelas não foram criadas.

**Fix:**
```bash
npx prisma migrate dev --name init
```

Se o banco estiver corrompido ou com estado inconsistente:
```bash
npx prisma migrate reset   # apaga tudo e recria do zero
```

---

## 2. `database is locked`

```
Error: SQLite database error
database is locked
```

**Causa:** outro processo está com o arquivo `dev.db` aberto — servidor Next.js rodando, Prisma Studio aberto, ou um lock file órfão de um processo que morreu sujo.

**Fix em ordem crescente de força:**

```bash
# 1. Para o servidor Next.js (Ctrl+C no terminal) e tenta de novo

# 2. Mata processos por nome
pkill -f "next"
pkill -f "prisma studio"
npx prisma migrate dev

# 3. Se ainda travar — mata todo Node
killall node
npx prisma migrate dev

# 4. Descobre quem está segurando o arquivo
lsof | grep dev.db
kill -9 <PID_retornado>

# 5. Remove lock files órfãos e tenta de novo
rm -f prisma/dev.db-wal prisma/dev.db-shm
npx prisma migrate dev
```

---

## 3. Tipos TypeScript desatualizados após migration

```
Type 'number | null' is not assignable to type 'string | null | undefined'
```

**Causa:** o Prisma client não foi regenerado após a migration — os tipos ainda refletem o schema antigo.

**Fix:**
```bash
npx prisma generate
```

> `migrate dev` já chama `generate` automaticamente, mas às vezes o TypeScript Server do editor não recarrega os tipos novos. Se o erro persistir no editor após o generate:
> - VSCode/Cursor: `Cmd+Shift+P → TypeScript: Restart TS Server`
> - Ou fecha e reabre o editor
>
> **Regra prática:** se o erro de tipo parece impossível (o schema está certo, o generate rodou, mas o TS continua reclamando) — é quase sempre cache do TS Server. Restart antes de debugar qualquer outra coisa.

---

## 4. `mode: 'insensitive'` quebrando com SQLite

```
Error: Invalid value for argument `mode`: `insensitive` is not supported for SQLite
```

**Causa:** `mode: 'insensitive'` no `findMany` é exclusivo do PostgreSQL — SQLite não suporta.

**Fix:** remover o `mode`:
```ts
// ❌ quebra no SQLite
where: { text: { contains: query, mode: 'insensitive' } }

// ✅ SQLite já faz case-insensitive em ASCII por padrão
where: { text: { contains: query } }
```

> Quando migrar para PostgreSQL no futuro, adicionar `mode: 'insensitive'` de volta.

---

## 5. `skipDuplicates` não funciona com SQLite

```ts
// ❌ SQLite não suporta
await prisma.highlight.createMany({ data, skipDuplicates: true })
```

**Causa:** `skipDuplicates` usa `INSERT OR IGNORE` internamente, que o Prisma só implementa para PostgreSQL e MySQL.

**Fix:** remover a opção ou tratar duplicatas manualmente antes:
```ts
// ✅
await prisma.highlight.createMany({ data })

// Ou filtrar antes de inserir:
const existing = await prisma.highlight.findMany({ select: { id: true } })
const existingIds = new Set(existing.map(h => h.id))
const newData = data.filter(h => !existingIds.has(h.id))
await prisma.highlight.createMany({ data: newData })
```

---

## 6. Ordenação numérica errada em campo String

```ts
// location salvo como String — ordena lexicograficamente
// "10", "2", "42" → resultado: "10", "2", "42" (errado)
// deveria ser: 2, 10, 42
orderBy: { location: 'asc' }
```

**Causa:** campo numérico tipado como `String?` no schema — SQLite ordena como texto.

**Fix:** migrar o campo para `Int?`:
```prisma
model Highlight {
  location  Int?   // era String?
}
```
```bash
npx prisma migrate dev --name location_string_to_int
npx prisma generate
```

---

## 7. Múltiplas instâncias do PrismaClient em dev

```
warn(prisma-client) There are already 10 instances of Prisma Client actively running.
```

**Causa:** hot reload do Next.js recria módulos a cada mudança — sem singleton, uma nova instância do `PrismaClient` é criada a cada reload, esgotando as conexões.

**Fix:** usar o padrão singleton obrigatório em `src/lib/prisma.ts`:
```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 8. Prisma em Edge Runtime

```
Error: PrismaClient is not supported in Edge Runtime
```

**Causa:** Prisma usa APIs do Node.js (`fs`, `net`, etc.) que não existem no Edge Runtime do Next.js.

**Fix:** garantir que todo arquivo que importa `prisma` usa Node.js runtime. Em Server Actions e Server Components isso é automático. O problema aparece se colocar Prisma em `middleware.ts` ou em routes com `export const runtime = 'edge'`.

```ts
// ❌ nunca fazer isso
// middleware.ts
import { prisma } from '@/lib/prisma'

// ✅ middleware não acessa banco — delega para Server Actions
```

---

## Referência Rápida de Comandos

| Situação | Comando |
|---|---|
| Primeira vez / tabelas não existem | `npx prisma migrate dev --name init` |
| Mudei o schema | `npx prisma migrate dev --name descricao` |
| Tipos TypeScript errados | `npx prisma generate` |
| Banco corrompido / resetar tudo | `npx prisma migrate reset` |
| Ver dados no banco | `npx prisma studio` |
| Banco travado | `killall node && rm -f prisma/dev.db-wal prisma/dev.db-shm` |
| Validar schema sem migrar | `npx prisma validate` |