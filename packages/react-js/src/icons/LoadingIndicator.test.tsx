import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import LoadingIndicator from "./LoadingIndicator";

describe("LoadingIndicator", () => {
  it("should render with default black fill when no fill prop is provided", () => {
    const { container } = render(<LoadingIndicator />);
    const path = container.querySelector("path");
    expect(path?.getAttribute("fill")).toBe("black");
  });

  it("should render with custom fill when fill prop is provided", () => {
    const { container } = render(<LoadingIndicator fill="white" />);
    const path = container.querySelector("path");
    expect(path?.getAttribute("fill")).toBe("white");
  });
});
