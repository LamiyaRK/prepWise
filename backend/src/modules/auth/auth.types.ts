export interface RegisterInput {
  name: string
  email: string
  password: string
  university?: string
}

export interface LoginInput {
  email: string
  password: string
}