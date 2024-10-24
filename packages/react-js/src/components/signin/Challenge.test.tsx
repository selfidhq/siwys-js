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
    const qrCodeSvgs = screen.getAllByRole("img");
    expect(qrCodeSvgs.length).toBe(1);
    expect(qrCodeSvgs[0]).toBeInTheDocument();
  });
});
