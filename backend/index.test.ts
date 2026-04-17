import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import request from "supertest"
import { createApp } from "./index"
import User from "./src/entities/User"

const createUserRepositoryMock = () => {
  const users = new Map<string, User>()

  return {
    create(payload: { googleId: string; email: string; name?: string }) {
      const user = new User()
      user.id = crypto.randomUUID()
      user.googleId = payload.googleId
      user.email = payload.email
      user.name = payload.name ?? null
      return user
    },
    async save(user: User) {
      users.set(user.id, user)
      return user
    },
    async findOneBy(where: { id: string }) {
      return users.get(where.id) ?? null
    },
    async find() {
      return Array.from(users.values())
    },
    async remove(user: User) {
      users.delete(user.id)
      return user
    },
  }
}

describe("backend api", () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalDevApiEnabled = process.env.DEV_API_ENABLED

  beforeEach(() => {
    process.env.NODE_ENV = "development"
    process.env.DEV_API_ENABLED = "true"
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    process.env.DEV_API_ENABLED = originalDevApiEnabled
  })

  test("GET /health returns ok", async () => {
    const app = createApp(createUserRepositoryMock())
    const res = await request(app).get("/health")
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: "ok" })
  })

  test("POST /api/events creates event", async () => {
    const app = createApp(createUserRepositoryMock())
    const res = await request(app).post("/api/events").send({
      title: "初回打ち合わせ",
      organizerName: "Kenta",
      candidates: [
        { start: "2026-04-20T10:00:00.000Z", end: "2026-04-20T10:30:00.000Z" },
      ],
    })

    expect(res.status).toBe(201)
    expect(res.body.event.title).toBe("初回打ち合わせ")
    expect(res.body.event.organizerName).toBe("Kenta")
    expect(res.body.event.linkId.length).toBe(12)
  })

  test("POST /api/dev/users creates user", async () => {
    const app = createApp(createUserRepositoryMock())
    const res = await request(app).post("/api/dev/users").send({
      googleId: "google-123",
      email: "test@example.com",
      name: "Taro",
    })

    expect(res.status).toBe(201)
    expect(res.body.user.googleId).toBe("google-123")
    expect(res.body.user.email).toBe("test@example.com")
    expect(res.body.user.name).toBe("Taro")
  })

  test("GET /api/dev/users/:id returns 404 when user does not exist", async () => {
    const app = createApp(createUserRepositoryMock())
    const res = await request(app).get(`/api/dev/users/${crypto.randomUUID()}`)
    expect(res.status).toBe(404)
    expect(res.body.error).toBe("User not found.")
  })

  test("GET /api/dev/users lists users", async () => {
    const app = createApp(createUserRepositoryMock())

    const created = await request(app).post("/api/dev/users").send({
      googleId: "google-1",
      email: "a@example.com",
      name: "A",
    })
    expect(created.status).toBe(201)

    const listRes = await request(app).get("/api/dev/users")
    expect(listRes.status).toBe(200)
    expect(listRes.body.users).toHaveLength(1)
    expect(listRes.body.users[0].googleId).toBe("google-1")
  })

  test("returns 404 on /api/dev in production mode", async () => {
    try {
      process.env.NODE_ENV = "production"
      process.env.DEV_API_ENABLED = "true"
      const app = createApp(createUserRepositoryMock())
      const res = await request(app).get("/api/dev/users")
      expect(res.status).toBe(404)
    } finally {
      process.env.NODE_ENV = "development"
      process.env.DEV_API_ENABLED = "true"
    }
  })

  test("returns 404 on /api/dev when DEV_API_ENABLED is false", async () => {
    process.env.NODE_ENV = "development"
    process.env.DEV_API_ENABLED = "false"
    const app = createApp(createUserRepositoryMock())
    const res = await request(app).get("/api/dev/users")
    expect(res.status).toBe(404)
  })
})
