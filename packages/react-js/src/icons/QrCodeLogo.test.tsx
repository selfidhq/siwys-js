import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { QrCodeLogoBlack, QrCodeLogoWhite } from "./index";

describe("QrCodeLogo", () => {
  it("should render the QrCodeLogoBlack SVG element", () => {
    const { container } = render(<QrCodeLogoBlack />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render the QrCodeLogoWhite SVG element", () => {
    const { container } = render(<QrCodeLogoWhite />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
