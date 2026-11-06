import type { Express, Request, Response } from "express"
import { OAuth2Client } from "google-auth-library"
import AppDataSource from "../data-source"
import User from "../entities/User"
import { resolveUserRepository, type UserRepositoryLike } from "./dev-users/common"

const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
const GOOGLE_USERINFO_TIMEOUT_MS = 5000

type GoogleUserInfo = {
  sub: string
  email: string
  name?: string
}

export type GoogleTokenInfo = {
  aud?: unknown
  sub?: unknown
  email?: unknown
}

export type GoogleTokenVerifier = (accessToken: string) => Promise<GoogleTokenInfo>

const oauth2Client = new OAuth2Client()

const defaultGoogleTokenVerifier: GoogleTokenVerifier = (accessToken) =>
  oauth2Client.getTokenInfo(accessToken)

const getGoogleClientId = () =>
  process.env.GOOGLE_CLIENT_ID?.trim() || process.env.VITE_GOOGLE_CLIENT_ID?.trim()

const validateGoogleUserInfo = (value: unknown): GoogleUserInfo => {
  if (typeof value !== "object" || value === null) {
    throw new Error("Google userinfo response must be an object.")
  }

  const profile = value as Record<string, unknown>
  if (typeof profile.sub !== "string" || profile.sub.trim().length === 0) {
    throw new Error("Google userinfo response is missing a valid sub.")
  }
  if (typeof profile.email !== "string" || profile.email.trim().length === 0) {
    throw new Error("Google userinfo response is missing a valid email.")
  }
  if (profile.name !== undefined && typeof profile.name !== "string") {
    throw new Error("Google userinfo response has an invalid name.")
  }

  return {
    sub: profile.sub.trim(),
    email: profile.email.trim(),
    name:
      typeof profile.name === "string" && profile.name.trim().length > 0
        ? profile.name.trim()
        : undefined,
  }
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(GOOGLE_USERINFO_TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new Error("Failed to verify Google token.")
  }
  return validateGoogleUserInfo(await res.json())
}

const validateGoogleToken = async (
  accessToken: string,
  profile: GoogleUserInfo,
  clientId: string,
  verifyGoogleToken: GoogleTokenVerifier
) => {
  const tokenInfo = await verifyGoogleToken(accessToken)
  if (typeof tokenInfo.aud !== "string" || tokenInfo.aud !== clientId) {
    throw new Error("Google token audience does not match this application.")
  }
  if (typeof tokenInfo.sub === "string" && tokenInfo.sub !== profile.sub) {
    throw new Error("Google token subject does not match the userinfo response.")
  }
  if (
    typeof tokenInfo.email === "string" &&
    tokenInfo.email.trim().toLowerCase() !== profile.email.toLowerCase()
  ) {
    throw new Error("Google token email does not match the userinfo response.")
  }
}

export const registerAuthRoutes = (
  app: Express,
  userRepository?: UserRepositoryLike,
  verifyGoogleToken: GoogleTokenVerifier = defaultGoogleTokenVerifier
) => {
  app.post("/api/auth/verify", async (req: Request, res: Response) => {
    const { accessToken } = req.body as { accessToken?: string }
    if (typeof accessToken !== "string" || !accessToken.trim()) {
      res.status(400).json({ error: "accessToken is required." })
      return
    }

    const clientId = getGoogleClientId()
    if (!clientId) {
      res.status(500).json({ error: "Google OAuth client is not configured." })
      return
    }

    try {
      const profile = await fetchGoogleUserInfo(accessToken)
      await validateGoogleToken(accessToken, profile, clientId, verifyGoogleToken)
      const repo = resolveUserRepository(userRepository)
      let user = await repo.findOneBy({ googleId: profile.sub })
      if (!user) {
        const candidate = repo.create({
          googleId: profile.sub,
          email: profile.email,
          name: profile.name ?? undefined,
        })
        user = await repo.save(candidate)
      }

      ;(req.session as unknown as Record<string, unknown>).userId = user.id

      res.json({
        user: {
          id: user.id,
          googleId: user.googleId,
          email: user.email,
          name: user.name,
        },
      })
    } catch {
      res.status(401).json({ error: "Invalid Google token." })
    }
  })

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.clearCookie("tsunagari.sid")
      res.json({ status: "ok" })
    })
  })

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const userId = ((req.session as unknown) as Record<string, unknown>)?.userId as string | undefined
    if (!userId) {
      res.status(401).json({ error: "Unauthorized." })
      return
    }

    try {
      const repo = resolveUserRepository(userRepository)
      const user = await (repo as { findOneBy: (where: { id: string }) => Promise<User | null> }).findOneBy({ id: userId })
      if (!user) {
        res.status(401).json({ error: "User not found." })
        return
      }
      res.json({
        user: {
          id: user.id,
          googleId: user.googleId,
          email: user.email,
          name: user.name,
        },
      })
    } catch {
      res.status(500).json({ error: "Internal server error." })
    }
  })
}
