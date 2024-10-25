import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import Challenge from "./Challenge";

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
  }));
});

describe("Challenge Component", () => {
  it("should render the QR code for the challengeUrl", () => {
    render(<Challenge challengeUrl="http://test-url" />);
    const qrCode = screen.getAllByRole("img")[0];
    expect(qrCode).toBeInTheDocument();
  });

  it("should embed the SELF logo inside the QR code", () => {
    render(<Challenge challengeUrl="http://test-url" />);
    const qrCode = screen.getAllByRole("img")[0];
    // find the logo based on its encoded dataUrl
    const logo = qrCode.querySelector(`[href^="data:image/svg+xml"]`);
    expect(logo).toBeInTheDocument();
  });
});
