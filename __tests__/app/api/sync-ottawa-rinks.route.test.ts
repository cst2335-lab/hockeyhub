import { afterEach, describe, expect, it, vi } from 'vitest'
import * as serviceModule from '@/lib/supabase/service'
import { GET } from '@/app/api/sync-ottawa-rinks/route'

type ProbeError = { message: string } | null

function createProbeClient(columnProbeErrors: Record<string, ProbeError>) {
  return {
    from: (table: string) => {
      if (table !== 'rinks') {
        throw new Error(`Unexpected table: ${table}`)
      }

      return {
        select: (columns: string, options?: { head?: boolean; count?: 'exact' }) => {
          if (options?.head) {
            return Promise.resolve({ count: 7, error: null })
          }

          return {
            limit: async (_value: number) => ({
              data: [],
              error: columnProbeErrors[columns] ?? null,
            }),
          }
        },
      }
    },
  }
}

describe('sync ottawa rinks test mode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports optional column support in test mode', async () => {
    const client = createProbeClient({
      data_source: null,
      last_synced_at: { message: 'column "last_synced_at" does not exist' },
      last_synced: null,
    })

    vi.spyOn(serviceModule, 'createServiceClient').mockReturnValue(client as never)

    const response = await GET(new Request('http://localhost/api/sync-ottawa-rinks?test=true'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.test).toBe(true)
    expect(body.current_rinks).toBe(7)
    expect(body.optional_columns).toEqual({
      data_source: true,
      last_synced_at: false,
      last_synced: true,
    })
  })

  it('keeps optional column as false on non-missing-column probe failures', async () => {
    const client = createProbeClient({
      data_source: { message: 'permission denied for relation rinks' },
      last_synced_at: null,
      last_synced: null,
    })

    vi.spyOn(serviceModule, 'createServiceClient').mockReturnValue(client as never)

    const response = await GET(new Request('http://localhost/api/sync-ottawa-rinks?test=true'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.optional_columns).toEqual({
      data_source: false,
      last_synced_at: true,
      last_synced: true,
    })
  })
})
