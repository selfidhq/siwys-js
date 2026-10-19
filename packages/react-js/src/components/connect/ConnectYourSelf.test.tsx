import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConnectYourSelf from "./ConnectYourSelf";
import {
  assignActiveWindow,
  EXTENSION_STORE_URLS,
} from "../../utils/extensionBridge";

jest.mock("../../utils/extensionBridge", () => {
  const actual = jest.requireActual("../../utils/extensionBridge");
  return {
    ...actual,
    assignActiveWindow: jest.fn(),
  };
});

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

  it("redirects the active window to the browser store when the extension is unavailable", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 Chrome/123.0.0.0 Safari/537.36",
    });
    const open = jest.spyOn(window, "open").mockImplementation(() => null);

    render(
      <ConnectYourSelf
        challengeDID="did:test:extension"
        extensionConfig={{ detectionTimeoutMs: 1 }}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Connect your/i })
    );

    await waitFor(() =>
      expect(assignActiveWindow).toHaveBeenCalledWith(EXTENSION_STORE_URLS.chrome)
    );
    expect(open).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("dialog", {
        name: "SELF browser extension not detected",
      })
    ).not.toBeInTheDocument();
    open.mockRestore();
  });
});
