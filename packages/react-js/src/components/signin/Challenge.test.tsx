import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import Challenge from "./Challenge";

beforeEach(() => {
  window.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => {
        return { challengeUrl: "http://challenge-url" };
      },
    })
  );
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
  }));
});

describe("Challenge Component", () => {
  it("should not render the QR code unless the challenge has been generated", () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => {
          return {}; // no challengeUrl returned
        },
      })
    );

    render(<Challenge challengeUrl="http://challenge-api-url" />);
    const imgs = screen.queryAllByRole("img");
    expect(imgs.length).toBe(0);
  });

  it("should render the QR code for the challengeUrl", async () => {
    render(<Challenge challengeUrl="http://challenge-api-url" />);
    const imgs = await screen.findAllByRole("img");
    expect(imgs[0]).toBeInTheDocument();
  });

  it("should embed the SELF logo inside the QR code", async () => {
    render(<Challenge challengeUrl="http://challenge-api-url" />);
    const imgs = await screen.findAllByRole("img");
    // find the logo based on its encoded dataUrl
    const logo = imgs[0].querySelector(`[href^="data:image/svg+xml"]`);
    expect(logo).toBeInTheDocument();
  });
});
