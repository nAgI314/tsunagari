import type { Express, Request, Response } from "express"
import AppDataSource from "../data-source"
import User from "../entities/User"
import { resolveUserRepository, type UserRepositoryLike } from "./dev-users/common"

type GoogleUserInfo = {
  sub: string
  email: string
  name?: string
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  if (!res.ok) {
    throw new Error("Failed to verify Google token.")
  }
  return (await res.json()) as GoogleUserInfo
}

export const registerAuthRoutes = (app: Express, userRepository?: UserRepositoryLike) => {
  app.post("/api/auth/verify", async (req: Request, res: Response) => {
    const { accessToken } = req.body as { accessToken?: string }
    if (typeof accessToken !== "string" || !accessToken.trim()) {
      res.status(400).json({ error: "accessToken is required." })
      return
    }

    try {
      const profile = await fetchGoogleUserInfo(accessToken)
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
