import { describe, expect, test } from "bun:test";
import request from "supertest";
import { createApp } from "./index";

describe("backend api", () => {
  test("GET /health returns ok", async () => {
    const app = createApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  test("POST /api/events creates event", async () => {
    const app = createApp();
    const res = await request(app).post("/api/events").send({
      title: "初回打ち合わせ",
      organizerName: "Kenta",
      candidates: [
        { start: "2026-04-20T10:00:00.000Z", end: "2026-04-20T10:30:00.000Z" },
      ],
    });

    expect(res.status).toBe(201);
    expect(res.body.event.title).toBe("初回打ち合わせ");
    expect(res.body.event.organizerName).toBe("Kenta");
    expect(res.body.event.linkId.length).toBe(12);
  });

  test("POST /api/events returns 400 on invalid payload", async () => {
    const app = createApp();
    const res = await request(app).post("/api/events").send({
      title: "",
      organizerName: "Kenta",
      candidates: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
