import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { QrCodeLogo } from "./index";

describe("QrCodeLogo", () => {
  it("should render the SVG element", () => {
    const { container } = render(<QrCodeLogo />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
