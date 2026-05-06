import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../config/prisma'
import { RegisterInput, LoginInput } from './auth.types'

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw new Error('Email already in use')

  const hashed = await bcrypt.hash(input.password, 10)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      university: input.university
    }
  })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })

  return { token, user: { id: user.id, name: user.name, email: user.email } }
}

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) throw new Error('Invalid email or password')

  const valid = await bcrypt.compare(input.password, user.password)
  if (!valid) throw new Error('Invalid email or password')

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })

  return { token, user: { id: user.id, name: user.name, email: user.email } }
}