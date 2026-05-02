import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // For Supabase: prefer DIRECT_URL for write operations, DATABASE_URL for read-heavy operations
  // Use DIRECT_URL to bypass connection pooler for better transaction handling
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set')
  }

  const pool = new pg.Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX ?? 5),
    min: 2, // Maintain minimum connections
    idleTimeoutMillis: 60_000,
    connectionTimeoutMillis: 60_000,
    statement_timeout: 60_000,
    allowExitOnIdle: false, // Keep connections alive
  })

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Cache prisma instance in both development and production to avoid exhausting connection pool
globalForPrisma.prisma = prisma