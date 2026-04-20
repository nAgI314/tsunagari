import AppDataSource from "../../data-source"
import User from "../../entities/User"

export type UserPayload = {
  googleId: string
  email: string
  name?: string
}

export type UserRepositoryLike = {
  create: (payload: UserPayload) => User
  save: (user: User) => Promise<User>
  findOneBy: (where: { id: string }) => Promise<User | null>
  find: () => Promise<User[]>
  remove: (user: User) => Promise<User>
}

export const resolveUserRepository = (userRepository?: UserRepositoryLike) =>
  userRepository ?? AppDataSource.getRepository(User)

export const mapUser = (user: User) => ({
  id: user.id,
  googleId: user.googleId,
  email: user.email,
  name: user.name,
})

export const validateUserPayload = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return { ok: false as const, message: "Body must be an object." }
  }

  const candidate = value as Record<string, unknown>
  if (typeof candidate.googleId !== "string" || candidate.googleId.trim().length === 0) {
    return { ok: false as const, message: "googleId is required." }
  }
  if (typeof candidate.email !== "string" || candidate.email.trim().length === 0) {
    return { ok: false as const, message: "email is required." }
  }
  if (candidate.name !== undefined && typeof candidate.name !== "string") {
    return { ok: false as const, message: "name must be a string when provided." }
  }

  return {
    ok: true as const,
    value: {
      googleId: candidate.googleId.trim(),
      email: candidate.email.trim(),
      name: typeof candidate.name === "string" ? candidate.name.trim() : undefined,
    },
  }
}

export const validateUserPatchPayload = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return { ok: false as const, message: "Body must be an object." }
  }
  const candidate = value as Record<string, unknown>
  const hasEmail = candidate.email !== undefined
  const hasName = candidate.name !== undefined
  if (!hasEmail && !hasName) {
    return { ok: false as const, message: "email or name is required." }
  }
  if (hasEmail && (typeof candidate.email !== "string" || candidate.email.trim().length === 0)) {
    return { ok: false as const, message: "email must be a non-empty string." }
  }
  if (
    hasName &&
    candidate.name !== null &&
    (typeof candidate.name !== "string" || candidate.name.trim().length === 0)
  ) {
    return { ok: false as const, message: "name must be a non-empty string or null." }
  }
  return {
    ok: true as const,
    value: {
      email: typeof candidate.email === "string" ? candidate.email.trim() : undefined,
      name:
        candidate.name === null
          ? null
          : typeof candidate.name === "string"
            ? candidate.name.trim()
            : undefined,
    },
  }
}
