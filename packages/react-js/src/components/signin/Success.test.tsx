import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import Success from "./Success";

describe("Success Component", () => {
  it("should render the success message", () => {
    render(<Success />);
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("should render the 'Sign in with your' heading", () => {
    render(<Success />);
    expect(screen.getByText(/Sign in with your/)).toBeInTheDocument();
  });

  it("should render the SELF trademark text", () => {
    render(<Success />);
    expect(screen.getByText("SELF")).toBeInTheDocument();
    expect(screen.getByText("™")).toBeInTheDocument();
  });

  it("should render the CircleLogoWhite icon", () => {
    const { container } = render(<Success />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
