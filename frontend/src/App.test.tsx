import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import App from "./App";

describe("App", () => {
  test("creates event and shows created link id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        event: {
          id: "evt1",
          linkId: "abc123def456",
          title: "初回打ち合わせ",
          organizerName: "Kenta",
          candidates: [],
          createdAt: "2026-04-20T00:00:00.000Z",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await userEvent.type(screen.getByLabelText("タイトル"), "初回打ち合わせ");
    await userEvent.type(screen.getByLabelText("主催者名"), "Kenta");
    await userEvent.type(screen.getByLabelText("候補開始"), "2026-04-20T10:00");
    await userEvent.type(screen.getByLabelText("候補終了"), "2026-04-20T10:30");
    await userEvent.click(screen.getByRole("button", { name: "リンクを作成" }));

    expect(await screen.findByRole("status")).toHaveTextContent("/event/abc123def456");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("shows validation error before request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await userEvent.type(screen.getByLabelText("タイトル"), "初回打ち合わせ");
    await userEvent.type(screen.getByLabelText("主催者名"), "Kenta");
    await userEvent.type(screen.getByLabelText("候補開始"), "2026-04-20T11:00");
    await userEvent.type(screen.getByLabelText("候補終了"), "2026-04-20T10:30");

    expect(screen.getByRole("button", { name: "リンクを作成" })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
