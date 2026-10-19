import {
  extensionPartnerPayload,
  extensionSignInResult,
  requestExtensionSignIn,
  resolveDesktopExtensionBrowser,
  MOBILE_APP_OPEN_FALLBACK_MS,
  openInstalledMobileApp,
  resolveMobileAppStoreUrl,
  MOBILE_APP_STORE_URLS,
} from "./extensionBridge";

const request = {
  challengeDID: "did:test:challenge",
  challengeUrl: "https://www.selfid.link/challenge?challenge=did:test:challenge",
};

const sendStatus = (requestId: string, status: string) => {
  window.dispatchEvent(
    new MessageEvent("message", {
      source: window,
      data: {
        source: "self-id-browser-extension",
        version: "1",
        type: "self-id:extension:status",
        requestId,
        status,
      },
    })
  );
};

describe("requestExtensionSignIn", () => {
  let postMessageSpy: jest.SpyInstance;

  const sentTypes = () =>
    postMessageSpy.mock.calls.map(([message]) => message.type);
  const signInRequestId = () => postMessageSpy.mock.calls[0][0].requestId;

  beforeEach(() => {
    postMessageSpy = jest
      .spyOn(window, "postMessage")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    postMessageSpy.mockRestore();
    jest.useRealTimers();
  });

  it("sends a cancel with the same requestId when cleaned up while pending", () => {
    const cleanup = requestExtensionSignIn(request, jest.fn());
    sendStatus(signInRequestId(), "pending");

    cleanup();

    expect(sentTypes()).toEqual([
      "self-id:extension:sign-in",
      "self-id:extension:cancel",
    ]);
    expect(postMessageSpy.mock.calls[1]).toEqual([
      {
        source: "self-id-partner-web-sdk",
        version: "1",
        type: "self-id:extension:cancel",
        requestId: signInRequestId(),
      },
      window.location.origin,
    ]);
  });

  it.each(["approved", "rejected", "error"])(
    "does not send a cancel after a %s status",
    (status) => {
      const cleanup = requestExtensionSignIn(request, jest.fn());
      sendStatus(signInRequestId(), status);

      cleanup();

      expect(sentTypes()).toEqual(["self-id:extension:sign-in"]);
    }
  );

  it("sends a cancel only once when cleaned up twice", () => {
    const cleanup = requestExtensionSignIn(request, jest.fn());

    cleanup();
    cleanup();

    expect(sentTypes()).toEqual([
      "self-id:extension:sign-in",
      "self-id:extension:cancel",
    ]);
  });

  it("reports an error and sends a cancel when the request times out", () => {
    jest.useFakeTimers();
    const onStatus = jest.fn();
    requestExtensionSignIn(request, onStatus, 1000);
    sendStatus(signInRequestId(), "pending");

    jest.advanceTimersByTime(1000);

    expect(onStatus).toHaveBeenLastCalledWith({
      requestId: signInRequestId(),
      status: "error",
      code: "timed_out",
      error: "The SELF browser extension request timed out.",
    });
    expect(sentTypes()).toEqual([
      "self-id:extension:sign-in",
      "self-id:extension:cancel",
    ]);
  });

  it("does not time out after a final status", () => {
    jest.useFakeTimers();
    const onStatus = jest.fn();
    requestExtensionSignIn(request, onStatus, 1000);
    sendStatus(signInRequestId(), "approved");

    jest.advanceTimersByTime(1000);

    expect(onStatus).toHaveBeenCalledTimes(1);
    expect(sentTypes()).toEqual(["self-id:extension:sign-in"]);
  });
});

describe("extensionPartnerPayload", () => {
  it("keeps an https image with the partner name", () => {
    expect(
      extensionPartnerPayload({
        name: "  DMV  ",
        imageUrl: "https://dmv.example/logo.png",
      })
    ).toEqual({
      name: "DMV",
      imageUrl: "https://dmv.example/logo.png",
    });
  });

  it("drops an image that is not https", () => {
    expect(
      extensionPartnerPayload({
        name: "DMV",
        imageUrl: "javascript:alert(1)",
      })
    ).toEqual({ name: "DMV" });
  });

  it("returns nothing when the name is empty", () => {
    expect(extensionPartnerPayload({ name: "   " })).toBeUndefined();
  });
});

describe("extensionSignInResult", () => {
  it("maps the extension expiry message to a stable code", () => {
    expect(
      extensionSignInResult({
        challengeDID: "did:test:challenge",
        status: "error",
        error: "The request expired.",
      })
    ).toEqual({
      challengeDID: "did:test:challenge",
      status: "error",
      code: "expired",
      message: "The request expired.",
    });
  });

  it("prefers a code sent by the extension", () => {
    expect(
      extensionSignInResult({
        challengeDID: "did:test:challenge",
        status: "error",
        code: "timed_out",
        error: "Something else",
      }).code
    ).toBe("timed_out");
  });
});

describe("resolveDesktopExtensionBrowser", () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it.each([
    ["Mozilla/5.0 Chrome/123.0.0.0 Safari/537.36", "chrome"],
    ["Mozilla/5.0 Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0", "edge"],
    ["Mozilla/5.0 Firefox/123.0", "firefox"],
    ["Mozilla/5.0 Version/17.0 Safari/605.1.15", "safari"],
    ["Mozilla/5.0 iPhone Chrome/123.0.0.0 Mobile", null],
    ["Mozilla/5.0 Android Mobile", null],
  ])("maps %s to %s", (userAgent, browser) => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: userAgent,
    });
    expect(resolveDesktopExtensionBrowser()).toBe(browser);
  });
});

describe("resolveMobileAppStoreUrl", () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it.each([
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      MOBILE_APP_STORE_URLS.ios,
    ],
    [
      "Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit/537.36 Chrome/123.0.0.0 Mobile Safari/537.36",
      MOBILE_APP_STORE_URLS.android,
    ],
    ["Mozilla/5.0 Chrome/123.0.0.0 Safari/537.36", null],
  ])("maps %s to %s", (userAgent, storeUrl) => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: userAgent,
    });
    expect(resolveMobileAppStoreUrl()).toBe(storeUrl);
  });
});

describe("openInstalledMobileApp", () => {
  const challengeUrl = "https://www.selfid.link/challenge?challenge=did%3Atest";
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  it("opens the challenge link on Android, then the Play Store if the page stays visible", () => {
    jest.useFakeTimers();
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit/537.36 Chrome/123.0.0.0 Mobile Safari/537.36",
    });
    const assign = jest.fn();

    openInstalledMobileApp(challengeUrl, MOBILE_APP_STORE_URLS.android, assign);

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(challengeUrl);
    jest.advanceTimersByTime(MOBILE_APP_OPEN_FALLBACK_MS);
    expect(assign).toHaveBeenNthCalledWith(2, MOBILE_APP_STORE_URLS.android);
  });

  it("opens the challenge link, then the store if the page stays visible", () => {
    jest.useFakeTimers();
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
    });
    const assign = jest.fn();

    openInstalledMobileApp(challengeUrl, MOBILE_APP_STORE_URLS.ios, assign);

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(challengeUrl);
    jest.advanceTimersByTime(MOBILE_APP_OPEN_FALLBACK_MS);
    expect(assign).toHaveBeenNthCalledWith(2, MOBILE_APP_STORE_URLS.ios);
  });

  it("does not open the store after the app hides the page", () => {
    jest.useFakeTimers();
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    });
    const assign = jest.fn();

    openInstalledMobileApp(challengeUrl, MOBILE_APP_STORE_URLS.ios, assign);
    window.dispatchEvent(new Event("pagehide"));
    jest.advanceTimersByTime(MOBILE_APP_OPEN_FALLBACK_MS);

    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(challengeUrl);
  });
});
