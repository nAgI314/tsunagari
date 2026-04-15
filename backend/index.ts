import express from "express";
import {
  type CreateEventInput,
  type ScheduleEvent,
  validateCreateEventInput,
} from "../shared/src/index";

const buildEvent = (input: CreateEventInput): ScheduleEvent => {
  const id = crypto.randomUUID();
  const linkId = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  return {
    id,
    linkId,
    title: input.title,
    organizerName: input.organizerName,
    description: input.description,
    candidates: input.candidates,
    createdAt: new Date().toISOString(),
  };
};

export const createApp = () => {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/events", (req, res) => {
    const parsed = validateCreateEventInput(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message });
      return;
    }

    const event = buildEvent(parsed.value);
    res.status(201).json({ event });
  });

  return app;
};

if (import.meta.main) {
  const app = createApp();
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`backend listening on :${port}`);
  });
}
