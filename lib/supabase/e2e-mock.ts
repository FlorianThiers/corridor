import {
  E2E_EMAIL,
  E2E_PASSWORD,
  E2E_USER_ID,
  buildE2ETables,
  type E2ETables,
} from '@/lib/supabase/e2e-fixtures'

type Row = Record<string, unknown>

type Filter =
  | { op: 'eq'; column: string; value: unknown }
  | { op: 'in'; column: string; value: unknown[] }
  | { op: 'gte'; column: string; value: unknown }
  | { op: 'lt'; column: string; value: unknown }

type Order = { column: string; ascending: boolean }

type QueryError = { message: string; code?: string } | null

type QueryResult = {
  data: unknown
  error: QueryError
  count: number | null
}

const TABLES: E2ETables = buildE2ETables()

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''))
}

function matches(row: Row, filter: Filter): boolean {
  const cell = row[filter.column]
  if (filter.op === 'eq') return cell === filter.value
  if (filter.op === 'in') return filter.value.includes(cell)
  if (filter.op === 'gte') return compare(cell, filter.value) >= 0
  return compare(cell, filter.value) < 0
}

class E2EQuery implements PromiseLike<QueryResult> {
  private filters: Filter[] = []
  private orders: Order[] = []
  private limitN: number | null = null
  private rangeFrom: number | null = null
  private rangeTo: number | null = null
  private head = false
  private mode: 'many' | 'single' | 'maybe' = 'many'
  private embedZones = false

  constructor(
    private readonly table: keyof E2ETables | string,
  ) {}

  select(columns?: string, options?: { count?: string; head?: boolean }) {
    if (typeof columns === 'string' && columns.includes('zones')) this.embedZones = true
    if (options?.head) this.head = true
    return this
  }

  eq(column: string, value: unknown) {
    this.filters.push({ op: 'eq', column, value })
    return this
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ op: 'in', column, value })
    return this
  }

  gte(column: string, value: unknown) {
    this.filters.push({ op: 'gte', column, value })
    return this
  }

  lt(column: string, value: unknown) {
    this.filters.push({ op: 'lt', column, value })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending !== false })
    return this
  }

  limit(count: number) {
    this.limitN = count
    return this
  }

  range(from: number, to: number) {
    this.rangeFrom = from
    this.rangeTo = to
    return this
  }

  maybeSingle() {
    this.mode = 'maybe'
    return this
  }

  single() {
    this.mode = 'single'
    return this
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected)
  }

  private rows(): Row[] {
    const source = TABLES[this.table as keyof E2ETables]
    return Array.isArray(source) ? (source as Row[]) : []
  }

  private decorate(row: Row): Row {
    const copy = { ...row }
    if (!this.embedZones) return copy
    const zone = TABLES.zones.find((item) => item.id === row.zone_id) ?? null
    return { ...copy, zones: zone ? { ...zone } : null }
  }

  private execute(): QueryResult {
    let rows = this.rows().filter((row) => this.filters.every((filter) => matches(row, filter)))

    if (this.orders.length > 0) {
      rows = [...rows].sort((a, b) => {
        for (const order of this.orders) {
          const diff = compare(a[order.column], b[order.column])
          if (diff !== 0) return order.ascending ? diff : -diff
        }
        return 0
      })
    }

    const count = rows.length

    if (this.rangeFrom != null) {
      const to = this.rangeTo ?? rows.length - 1
      rows = rows.slice(this.rangeFrom, to + 1)
    } else if (this.limitN != null) {
      rows = rows.slice(0, this.limitN)
    }

    if (this.head) {
      return { data: null, error: null, count }
    }

    if (this.mode === 'many') {
      return { data: rows.map((row) => this.decorate(row)), error: null, count }
    }

    if (rows.length === 1) {
      return { data: this.decorate(rows[0]), error: null, count: 1 }
    }

    if (this.mode === 'maybe' && rows.length === 0) {
      return { data: null, error: null, count: 0 }
    }

    return {
      data: null,
      error: {
        message: 'JSON object requested, multiple (or no) rows returned',
        code: 'PGRST116',
      },
      count: rows.length,
    }
  }
}

type AuthListener = (event: string, session: { user: Row } | null) => void

function createAuth() {
  let currentUser: Row | null = null
  const listeners = new Set<AuthListener>()

  const user = () => ({
    id: E2E_USER_ID,
    email: E2E_EMAIL,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: { full_name: 'E2E Bezoeker' },
    created_at: '2026-01-01T00:00:00.000Z',
  })

  const notify = (event: string, session: { user: Row } | null) => {
    for (const listener of listeners) listener(event, session)
  }

  return {
    async getUser() {
      return { data: { user: currentUser }, error: null }
    },
    async getSession() {
      return {
        data: { session: currentUser ? { user: currentUser, access_token: 'e2e-mock-token' } : null },
        error: null,
      }
    },
    onAuthStateChange(callback: AuthListener) {
      listeners.add(callback)
      return {
        data: {
          subscription: {
            unsubscribe: () => listeners.delete(callback),
          },
        },
      }
    },
    async signInWithPassword(credentials: { email: string; password: string }) {
      if (credentials.email === E2E_EMAIL && credentials.password === E2E_PASSWORD) {
        currentUser = user()
        const session = { user: currentUser }
        notify('SIGNED_IN', session)
        return { data: { user: currentUser, session }, error: null }
      }
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 },
      }
    },
    async signUp() {
      return { data: { user: user(), session: null }, error: null }
    },
    async resetPasswordForEmail() {
      return { data: {}, error: null }
    },
    async signOut() {
      currentUser = null
      notify('SIGNED_OUT', null)
      return { error: null }
    },
  }
}

/** Eén in-memory client. Auth-status blijft op dit object (browser-singleton). */
export function createE2ESupabase() {
  const auth = createAuth()
  return {
    auth,
    from(table: string) {
      return new E2EQuery(table)
    },
  }
}
