import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import App from "./App";

describe("App", () => {
  test("renders scheduler topbar and help text", () => {
    render(<App />);

    expect(screen.getByText("Tsunagari")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Googleでログイン" })).toBeInTheDocument();
    expect(screen.getByText("週表示: 左右スクロールで前後の週を探索")).toBeInTheDocument();
  });

  test("toggles login label", async () => {
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "Googleでログイン" }));

    expect(screen.getByRole("button", { name: "Googleでログイン済み" })).toBeInTheDocument();
  });
});
