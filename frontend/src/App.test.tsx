import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test } from "vitest";
import App from "./App";

describe("App", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  test("renders scheduler topbar and help text", () => {
    render(<App />);

    expect(screen.getByText("Tsunagari")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Googleでログイン" })).toBeInTheDocument();
    expect(screen.getByText("週表示: 左右スクロールで前後の週を探索")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "プライバシーポリシー" })).toBeInTheDocument();
  });

  test("toggles login label", async () => {
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "Googleでログイン" }));

    expect(screen.getByRole("button", { name: "Googleでログイン済み" })).toBeInTheDocument();
  });

  test("renders 404 page for unknown route", () => {
    window.history.pushState({}, "", "/unknown-page");
    render(<App />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("ページが見つかりません")).toBeInTheDocument();
  });
});
