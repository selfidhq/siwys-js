import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import QRCode from "./QrCode";

describe("QRCode Component", () => {
  it("should render with required props", () => {
    render(<QRCode challengeUrl="https://example.com/challenge" size={200} />);
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should render the QR code as an SVG element", () => {
    const { container } = render(
      <QRCode challengeUrl="https://example.com/challenge" size={200} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should apply border-radius style", () => {
    render(<QRCode challengeUrl="https://example.com/challenge" size={200} />);
    const qrCode = screen.getByTestId("qr-code");
    expect(qrCode).toHaveStyle("border-radius: 16px");
  });

  it("should embed the SELF logo inside the QR code", () => {
    const { container } = render(
      <QRCode challengeUrl="https://example.com/challenge" size={200} />
    );
    const images = container.querySelectorAll("image");
    const logoImage = Array.from(images).find((img) =>
      img.getAttribute("href")?.includes("data:image/svg+xml")
    );
    expect(logoImage).toBeTruthy();
  });

  it("should apply className when provided", () => {
    render(
      <QRCode
        challengeUrl="https://example.com/challenge"
        size={200}
        className="custom-class"
      />
    );
    const qrCode = screen.getByTestId("qr-code");
    expect(qrCode).toHaveClass("custom-class");
  });

  it("should render with a custom level prop", () => {
    render(
      <QRCode
        challengeUrl="https://example.com/challenge"
        size={150}
        level="H"
      />
    );
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should render with different challengeUrl values", () => {
    const { rerender } = render(
      <QRCode challengeUrl="https://example.com/a" size={200} />
    );
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();

    rerender(<QRCode challengeUrl="https://example.com/b" size={200} />);
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });
});
