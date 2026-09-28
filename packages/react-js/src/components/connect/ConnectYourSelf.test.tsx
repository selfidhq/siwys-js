import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConnectYourSelf from "./ConnectYourSelf";

const originalUserAgent = navigator.userAgent;

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

  afterEach(() => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it("should render without errors", () => {
    render(
      <ConnectYourSelf challengeDID="did:test:123" onConnectPress={jest.fn()} />
    );
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should render CysButton with 'Connect your' text", () => {
    render(
      <ConnectYourSelf challengeDID="did:test:123" onConnectPress={jest.fn()} />
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
      <ConnectYourSelf challengeDID="did:test:456" onConnectPress={jest.fn()} />
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
      <ConnectYourSelf challengeDID="did:test:123" onConnectPress={jest.fn()} />
    );
    expect(screen.getByText("Connect your SELF™ Guide:")).toBeInTheDocument();
  });

  it("starts the browser extension flow on desktop Chromium", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 Chrome/123.0.0.0 Safari/537.36",
    });
    let signInRequest: any;
    const extensionResponder = (event: MessageEvent) => {
      const request = event.data;
      if (request.source !== "self-id-partner-web-sdk") return;

      if (request.type === "self-id:extension:detect") {
        window.dispatchEvent(
          new MessageEvent("message", {
            source: window,
            data: {
              source: "self-id-browser-extension",
              version: "1",
              type: "self-id:extension:available",
              requestId: request.requestId,
            },
          })
        );
      }
      if (request.type === "self-id:extension:sign-in") {
        signInRequest = request;
      }
    };
    window.addEventListener("message", extensionResponder);

    render(<ConnectYourSelf challengeDID="did:test:extension" />);
    await userEvent.click(
      screen.getByRole("button", { name: /Connect your/i })
    );

    await waitFor(() => {
      expect(signInRequest.payload).toEqual({
        challengeDID: "did:test:extension",
        challengeUrl: expect.stringContaining("challenge=did:test:extension"),
      });
    });

    window.removeEventListener("message", extensionResponder);
  });

  it("shows the configured installation action when the extension is unavailable", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 Chrome/123.0.0.0 Safari/537.36",
    });
    global.window.open = jest.fn();

    render(
      <ConnectYourSelf
        challengeDID="did:test:extension"
        extensionConfig={{
          installUrl: "https://example.test/install-extension",
          detectionTimeoutMs: 1,
        }}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Connect your/i })
    );

    const installDialog = await screen.findByRole("dialog", {
      name: "SELF browser extension not detected",
    });
    const installButton = screen.getByRole("button", { name: "Install" });
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    await userEvent.click(installButton);

    expect(installDialog).toHaveTextContent(
      "SELF browser extension not detected. Install it to continue."
    );
    expect(global.window.open).toHaveBeenCalledWith(
      "https://example.test/install-extension",
      "_blank"
    );
  });
});
