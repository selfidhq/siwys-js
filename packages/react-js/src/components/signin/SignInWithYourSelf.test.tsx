import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInWithYourSelf } from "../..";

const challengeUrl = "http://challenge-url";
const onSiwysPress = jest.fn();
const challengeDid = "did:challenge";
const checkAuthUrl = "http//backend/auth";
const createChallengeUrl = "http//backend/challenges";
let fetchMock: any;
const originalUserAgent = navigator.userAgent;

const fetchMockImpl = (input: RequestInfo | URL) => {
  const url = input.toString();

  if (url.includes("/auth")) {
    return Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ match: true }),
    });
  }

  if (url.includes("/challenges")) {
    return Promise.resolve({
      status: 200,
      json: () =>
        Promise.resolve({
          challenge: challengeDid,
          challengeUrl: "http://challenge-url",
        }),
    });
  }

  return Promise.resolve({
    status: 404,
    json: () => Promise.resolve({ error: "Not Found" }),
  });
};

describe("SignInWithYourSelf Component", () => {
  beforeEach(() => {
    window.fetch = jest.fn().mockImplementation(fetchMockImpl);

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
    // @ts-ignore
    fetchMock = jest.spyOn(window, "fetch").mockImplementation(fetchMockImpl);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it("should call the createChallengeUrl to generate a Challange", async () => {
    render(
      <SignInWithYourSelf
        createChallengeUrl={createChallengeUrl}
        pollForAuthUrl={checkAuthUrl}
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
        successComponent={<div>Success</div>}
      />
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(createChallengeUrl, {
        method: "POST",
      })
    );
  });

  it("accepts a challenge response without requiring challengeDID", async () => {
    window.fetch = jest.fn().mockResolvedValue({
      status: 201,
      json: () =>
        Promise.resolve({
          challenge: challengeDid,
          challengeUrl,
        }),
    });

    render(<SignInWithYourSelf createChallengeUrl={createChallengeUrl} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Creating sign-in challenge..."
    );
    expect(await screen.findByTestId("qr-code")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("accepts challengeDid from the challenge creation response", async () => {
    window.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: () =>
        Promise.resolve({
          challengeDid,
          challengeUrl,
        }),
    });

    render(<SignInWithYourSelf createChallengeUrl={createChallengeUrl} />);

    expect(await screen.findByTestId("qr-code")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an error when challenge creation fails", async () => {
    window.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    render(<SignInWithYourSelf createChallengeUrl={createChallengeUrl} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to create a sign-in challenge."
    );
    expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();
  });

  it("shows an error for an invalid challenge creation response", async () => {
    window.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ challengeUrl }),
    });

    render(<SignInWithYourSelf createChallengeUrl={createChallengeUrl} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to create a sign-in challenge."
    );
    expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();
  });

  it("renders the QR code with the provided challenge URL", () => {
    render(
      <SignInWithYourSelf
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
      />
    );
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("calls onSiwysPress when the sign-in button is clicked", async () => {
    render(
      <SignInWithYourSelf
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
      />
    );
    const signInButton = screen.getByRole("button", {
      name: /Sign in with your/i,
    });
    await userEvent.click(signInButton);
    expect(onSiwysPress).toHaveBeenCalledTimes(1);
  });

  it("renders CysButton instead of SiwysButton when isCYS is true", () => {
    render(
      <SignInWithYourSelf
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
        isCYS
      />
    );
    expect(
      screen.getByRole("button", { name: /Connect your/i })
    ).toBeInTheDocument();
  });

  it("opens the App Store when Apple button is clicked", async () => {
    global.window.open = jest.fn();
    render(
      <SignInWithYourSelf
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
      />
    );
    const appStoreButton = screen.getByTestId("apple-store-svg");
    expect(appStoreButton).toBeInTheDocument();
    await userEvent.click(appStoreButton);
    expect(global.window.open).toHaveBeenCalledWith(
      "https://apps.apple.com/us/app/self-id/id1663745416",
      "_blank"
    );
  });

  it("opens the Play Store when Google Play button is clicked", async () => {
    global.window.open = jest.fn();
    render(
      <SignInWithYourSelf
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
      />
    );
    const playStoreButton = screen.getByTestId("play-store-svg");
    expect(playStoreButton).toBeInTheDocument();
    await userEvent.click(playStoreButton);
    expect(global.window.open).toHaveBeenCalledWith(
      "https://play.google.com/store/apps/details?id=id.selfid",
      "_blank"
    );
  });

  it("should call the auth URL after receiving Challenge", async () => {
    jest.useFakeTimers();
    render(
      <SignInWithYourSelf
        createChallengeUrl={createChallengeUrl}
        pollForAuthUrl={checkAuthUrl}
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
        successComponent={<div>Success</div>}
      />
    );
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenLastCalledWith(
          `${checkAuthUrl}?challenge=${challengeDid}`
        );
      },
      { timeout: 6000 }
    );
  });

  it("should call the auth URL after receiving Challenge and render success component on authentication", async () => {
    jest.useFakeTimers();
    render(
      <SignInWithYourSelf
        createChallengeUrl={createChallengeUrl}
        pollForAuthUrl={checkAuthUrl}
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
        successComponent={<div data-testid="success">Success</div>}
      />
    );

    expect(fetchMock).not.toHaveBeenCalledWith(checkAuthUrl);

    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenLastCalledWith(
          `${checkAuthUrl}?challenge=${challengeDid}`
        );
      },
      { timeout: 6000 }
    );

    // Move time forward to trigger authentication
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.getByTestId("success")).toBeInTheDocument();
    });
  });

  it("should not call the auth URL if not configured", async () => {
    jest.useFakeTimers();
    render(
      <SignInWithYourSelf
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
        createChallengeUrl={createChallengeUrl}
      />
    );

    await waitFor(
      () => {
        expect(fetchMock).not.toHaveBeenLastCalledWith(
          `${checkAuthUrl}?challenge=${challengeDid}`
        );
      },
      { timeout: 6000 }
    );
  });

  describe("showLogo prop", () => {
    it("should show logo when showLogo is true (default)", () => {
      render(
        <SignInWithYourSelf
          challengeDID={challengeDid}
          onSiwysPress={onSiwysPress}
        />
      );

      expect(screen.getByTestId("sign-in-title")).toBeInTheDocument();
    });

    it("should show logo when showLogo is explicitly true", () => {
      render(
        <SignInWithYourSelf
          challengeDID={challengeDid}
          onSiwysPress={onSiwysPress}
          showLogo={true}
        />
      );
      expect(screen.getByTestId("sign-in-title")).toBeInTheDocument();
    });

    it("should hide logo when showLogo is false", () => {
      render(
        <SignInWithYourSelf
          challengeDID={challengeDid}
          onSiwysPress={onSiwysPress}
          showLogo={false}
        />
      );

      expect(screen.queryByTestId("sign-in-title")).not.toBeInTheDocument();
    });
  });

  describe("showInstructions prop", () => {
    it("should show instructions when showInstructions is true (default)", () => {
      render(
        <SignInWithYourSelf
          challengeDID={challengeDid}
          onSiwysPress={onSiwysPress}
        />
      );

      expect(
        screen.getByText("Sign in with your SELF™ Guide:")
      ).toBeInTheDocument();
    });

    it("should show instructions when showInstructions is explicitly true", () => {
      render(
        <SignInWithYourSelf
          challengeDID={challengeDid}
          onSiwysPress={onSiwysPress}
          showInstructions={true}
        />
      );

      expect(
        screen.getByText("Sign in with your SELF™ Guide:")
      ).toBeInTheDocument();
    });

    it("should hide instructions when showInstructions is false", () => {
      render(
        <SignInWithYourSelf
          challengeDID={challengeDid}
          onSiwysPress={onSiwysPress}
          showInstructions={false}
        />
      );

      expect(
        screen.queryByText("Sign in with your SELF™ Guide:")
      ).not.toBeInTheDocument();
    });
  });

  it("should open challengeUrl in new window when onSiwysPress is not provided", () => {
    global.window.open = jest.fn();
    render(<SignInWithYourSelf challengeDID={challengeDid} />);
    const signInButton = screen.getByRole("button", {
      name: /Sign in with your/i,
    });
    fireEvent.click(signInButton);
    expect(global.window.open).toHaveBeenCalledWith(
      expect.stringContaining("challenge="),
      "_blank"
    );
  });

  it("should handle non-200 polling response without setting authenticated", async () => {
    jest.useFakeTimers();
    const non200FetchMock = jest
      .fn()
      .mockImplementation((input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.includes("/challenges")) {
          return Promise.resolve({
            status: 200,
            json: () =>
              Promise.resolve({
                challenge: challengeDid,
                challengeUrl: "http://challenge-url",
              }),
          });
        }
        if (url.includes("/auth")) {
          return Promise.resolve({
            status: 500,
            json: () => Promise.resolve({ error: "Server Error" }),
          });
        }
        return Promise.resolve({
          status: 404,
          json: () => Promise.resolve({}),
        });
      });
    window.fetch = non200FetchMock;

    render(
      <SignInWithYourSelf
        createChallengeUrl={createChallengeUrl}
        pollForAuthUrl={checkAuthUrl}
        challengeDID={challengeDid}
        onSiwysPress={onSiwysPress}
        successComponent={<div data-testid="success">Success</div>}
      />
    );

    await waitFor(
      () => {
        expect(non200FetchMock).toHaveBeenLastCalledWith(
          `${checkAuthUrl}?challenge=${challengeDid}`
        );
      },
      { timeout: 6000 }
    );

    jest.advanceTimersByTime(5000);

    expect(screen.queryByTestId("success")).not.toBeInTheDocument();
  });

  it("starts the extension sign-in flow on desktop Chromium", async () => {
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
        window.dispatchEvent(
          new MessageEvent("message", {
            source: window,
            data: {
              source: "self-id-browser-extension",
              version: "1",
              type: "self-id:extension:status",
              requestId: request.requestId,
              status: "approved",
            },
          })
        );
      }
    };
    window.addEventListener("message", extensionResponder);

    render(<SignInWithYourSelf challengeDID={challengeDid} />);
    await userEvent.click(
      screen.getByRole("button", { name: /Sign in with your/i })
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Approve the request in the SELF browser extension."
      );
    });
    expect(signInRequest.payload).toEqual({
      challengeDID: challengeDid,
      challengeUrl: expect.stringContaining(`challenge=${challengeDid}`),
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Approval received. Completing sign-in..."
      );
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
      <SignInWithYourSelf
        challengeDID={challengeDid}
        extensionConfig={{
          installUrl: "https://example.test/install-extension",
          detectionTimeoutMs: 1,
        }}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Sign in with your/i })
    );

    const installButton = await screen.findByRole("button", {
      name: "Install extension",
    });
    await userEvent.click(installButton);

    expect(global.window.open).toHaveBeenCalledWith(
      "https://example.test/install-extension",
      "_blank"
    );
  });
});
