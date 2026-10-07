import { requestExtensionSignIn } from "./extensionBridge";

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
