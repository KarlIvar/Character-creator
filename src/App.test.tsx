import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the Daggerheart Character Creator heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Character Creator");
  });

  it("reports how many classes were loaded from the rules data", () => {
    render(<App />);
    expect(screen.getByText(/Loaded/)).toBeInTheDocument();
    expect(screen.getByText(/from the rules data/)).toBeInTheDocument();
  });
});
