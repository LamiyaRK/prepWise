import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../config/prisma'
import { RegisterInput, LoginInput } from './auth.types'

const signToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' })

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw new Error('Email already in use')

  if (!input.password || input.password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }

  const hashed = await bcrypt.hash(input.password, 10)

  // Role is never taken from the client — every self-registered account is a
  // plain USER (the schema default). ADMIN can only be granted via
  // prisma/seedAdmin.ts or by an existing admin through /api/admin/users/:id/role.
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      university: input.university,
    },
  })

  const token = signToken(user.id, user.role)

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
}

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) throw new Error('Invalid email or password')

  const valid = await bcrypt.compare(input.password, user.password)
  if (!valid) throw new Error('Invalid email or password')

  const token = signToken(user.id, user.role)

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
}
