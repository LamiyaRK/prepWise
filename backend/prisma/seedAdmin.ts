/**
 * Bootstraps (or promotes) the first admin account.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=changeme ADMIN_NAME="Admin" \
 *     npx ts-node prisma/seedAdmin.ts
 *
 * If a user with ADMIN_EMAIL already exists, it's promoted to ADMIN.
 * Otherwise a new admin account is created with the given credentials.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME ?? 'Admin'

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env vars are required')
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })
    console.log(`Promoted existing user ${updated.email} to ADMIN`)
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  const created = await prisma.user.create({
    data: { name, email, password: hashed, role: 'ADMIN' },
  })
  console.log(`Created new ADMIN user: ${created.email}`)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
