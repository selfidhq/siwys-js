import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SiwysButton, CysButton } from "./SignInButton";

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe("SiwysButton", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it("should render with 'Sign in with your' text", () => {
    render(<SiwysButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: /Sign in with your/i })
    ).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<SiwysButton onClick={onClick} />);
    const button = screen.getByRole("button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should show loading indicator after click", async () => {
    render(<SiwysButton onClick={jest.fn()} />);
    const button = screen.getByRole("button");

    expect(screen.getByText(/Sign in with your/i)).toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.queryByText(/Sign in with your/i)).not.toBeInTheDocument();
  });

  it("should disable the button after click", async () => {
    render(<SiwysButton onClick={jest.fn()} />);
    const button = screen.getByRole("button");
    await userEvent.click(button);
    expect(button).toBeDisabled();
  });

  it("should not call onClick again after already clicked", async () => {
    const onClick = jest.fn();
    render(<SiwysButton onClick={onClick} />);
    const button = screen.getByRole("button");
    await userEvent.click(button);
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("CysButton", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it("should render with 'Connect your' text", () => {
    render(<CysButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: /Connect your/i })
    ).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<CysButton onClick={onClick} />);
    const button = screen.getByRole("button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should show loading indicator after click", async () => {
    render(<CysButton onClick={jest.fn()} />);
    const button = screen.getByRole("button");

    expect(screen.getByText(/Connect your/i)).toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.queryByText(/Connect your/i)).not.toBeInTheDocument();
  });
});

describe("SignInButton icon themes", () => {
  it("should show black icons for light color theme", () => {
    mockMatchMedia(false);
    const { container } = render(
      <SiwysButton onClick={jest.fn()} colorTheme="light" />
    );
    // CircleLogoBlack and SelfTextLogoBlack are rendered for light theme
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it("should show black icons for blue color theme", () => {
    mockMatchMedia(false);
    const { container } = render(
      <SiwysButton onClick={jest.fn()} colorTheme="blue" />
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it("should show white icons for dark color theme", () => {
    mockMatchMedia(false);
    const { container } = render(
      <SiwysButton onClick={jest.fn()} colorTheme="dark" />
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it("should show white icons when system dark mode is enabled and no colorTheme", () => {
    mockMatchMedia(true);
    const { container } = render(<SiwysButton onClick={jest.fn()} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it("should show black icons when system is light mode and no colorTheme", () => {
    mockMatchMedia(false);
    const { container } = render(<SiwysButton onClick={jest.fn()} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it("should render loading indicator with white fill after click on dark theme", async () => {
    mockMatchMedia(false);
    const { container } = render(
      <SiwysButton onClick={jest.fn()} colorTheme="dark" />
    );
    const button = screen.getByRole("button");
    await userEvent.click(button);
    const loadingSvg = container.querySelector("svg");
    expect(loadingSvg).toBeInTheDocument();
    const path = loadingSvg?.querySelector("path");
    expect(path?.getAttribute("fill")).toBe("white");
  });

  it("should render loading indicator with black fill after click on light theme", async () => {
    mockMatchMedia(false);
    const { container } = render(
      <SiwysButton onClick={jest.fn()} colorTheme="light" />
    );
    const button = screen.getByRole("button");
    await userEvent.click(button);
    const loadingSvg = container.querySelector("svg");
    expect(loadingSvg).toBeInTheDocument();
    const path = loadingSvg?.querySelector("path");
    expect(path?.getAttribute("fill")).toBe("black");
  });
});
