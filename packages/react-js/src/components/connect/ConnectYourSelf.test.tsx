import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConnectYourSelf from "./ConnectYourSelf";

describe("ConnectYourSelf Component", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it("should render without errors", () => {
    render(
      <ConnectYourSelf
        challengeDID="did:test:123"
        onConnectPress={jest.fn()}
      />
    );
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should render CysButton with 'Connect your' text", () => {
    render(
      <ConnectYourSelf
        challengeDID="did:test:123"
        onConnectPress={jest.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: /Connect your/i })
    ).toBeInTheDocument();
  });

  it("should call onConnectPress when the button is clicked", async () => {
    const onConnectPress = jest.fn();
    render(
      <ConnectYourSelf
        challengeDID="did:test:123"
        onConnectPress={onConnectPress}
      />
    );
    const button = screen.getByRole("button", { name: /Connect your/i });
    await userEvent.click(button);
    expect(onConnectPress).toHaveBeenCalledTimes(1);
  });

  it("should render the QR code with the correct challenge URL", () => {
    render(
      <ConnectYourSelf
        challengeDID="did:test:456"
        onConnectPress={jest.fn()}
      />
    );
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should use challengeBaseUrl when provided", () => {
    render(
      <ConnectYourSelf
        challengeDID="did:test:789"
        challengeBaseUrl="https://custom-base.com"
        onConnectPress={jest.fn()}
      />
    );
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should render 'Connect your SELF™ Guide:' instructions", () => {
    render(
      <ConnectYourSelf
        challengeDID="did:test:123"
        onConnectPress={jest.fn()}
      />
    );
    expect(
      screen.getByText("Connect your SELF™ Guide:")
    ).toBeInTheDocument();
  });
});
