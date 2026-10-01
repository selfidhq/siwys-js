type ExtensionStatus = "ready" | "pending" | "approved" | "rejected" | "error";

export interface ExtensionBridgeConfig {
  installUrl?: string;
  detectionTimeoutMs?: number;
}

interface ExtensionSignInRequest {
  challengeDID: string;
  challengeUrl: string;
}

interface ExtensionStatusMessage {
  requestId: string;
  status: ExtensionStatus;
  error?: string;
}

const EXTENSION_BRIDGE = {
  version: "1",
  sdkSource: "self-id-partner-web-sdk",
  extensionSource: "self-id-browser-extension",
  messages: {
    detect: "self-id:extension:detect",
    signIn: "self-id:extension:sign-in",
    cancel: "self-id:extension:cancel",
    available: "self-id:extension:available",
    status: "self-id:extension:status",
  },
} as const;

const SDK_SOURCE = EXTENSION_BRIDGE.sdkSource;
const EXTENSION_SOURCE = EXTENSION_BRIDGE.extensionSource;
const BRIDGE_VERSION = EXTENSION_BRIDGE.version;
const DEFAULT_DETECTION_TIMEOUT_MS = 750;
const DEFAULT_SIGN_IN_TIMEOUT_MS = 5 * 60 * 1000;
const EXTENSION_STATUSES: ExtensionStatus[] = [
  "ready",
  "pending",
  "approved",
  "rejected",
  "error",
];

interface ExtensionBridgeRequest {
  source: typeof SDK_SOURCE;
  version: typeof BRIDGE_VERSION;
  type:
    | typeof EXTENSION_BRIDGE.messages.detect
    | typeof EXTENSION_BRIDGE.messages.signIn
    | typeof EXTENSION_BRIDGE.messages.cancel;
  requestId: string;
  payload?: ExtensionSignInRequest;
}

interface ExtensionBridgeResponse {
  source: typeof EXTENSION_SOURCE;
  version: typeof BRIDGE_VERSION;
  type:
    | typeof EXTENSION_BRIDGE.messages.available
    | typeof EXTENSION_BRIDGE.messages.status;
  requestId: string;
  status?: ExtensionStatus;
  error?: string;
}

const createRequestId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const isBridgeResponse = (data: unknown): data is ExtensionBridgeResponse => {
  if (!data || typeof data !== "object") return false;

  const response = data as Partial<ExtensionBridgeResponse>;
  const isStatusResponse = response.type === EXTENSION_BRIDGE.messages.status;
  return (
    response.source === EXTENSION_SOURCE &&
    response.version === BRIDGE_VERSION &&
    (response.type === EXTENSION_BRIDGE.messages.available ||
      response.type === EXTENSION_BRIDGE.messages.status) &&
    typeof response.requestId === "string" &&
    (!isStatusResponse ||
      (typeof response.status === "string" &&
        EXTENSION_STATUSES.includes(response.status as ExtensionStatus)))
  );
};

export const isDesktopChromiumBrowser = (): boolean => {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const isChromium = /Chrome|Chromium|Edg|OPR|Brave/i.test(userAgent);

  return isChromium && !isMobile;
};

export const detectExtension = (
  detectionTimeoutMs = DEFAULT_DETECTION_TIMEOUT_MS
): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false);

  const requestId = createRequestId();

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(false);
    }, detectionTimeoutMs);

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== window || !isBridgeResponse(event.data)) return;
      if (
        event.data.type === EXTENSION_BRIDGE.messages.available &&
        event.data.requestId === requestId
      ) {
        cleanup();
        resolve(true);
      }
    };

    const cleanup = () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);
    };

    window.addEventListener("message", handleMessage);
    const request: ExtensionBridgeRequest = {
      source: SDK_SOURCE,
      version: BRIDGE_VERSION,
      type: EXTENSION_BRIDGE.messages.detect,
      requestId,
    };
    window.postMessage(request, window.location.origin);
  });
};

export const requestExtensionSignIn = (
  request: ExtensionSignInRequest,
  onStatus: (message: ExtensionStatusMessage) => void,
  timeoutMs = DEFAULT_SIGN_IN_TIMEOUT_MS
): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const requestId = createRequestId();
  let isSettled = false;
  const timeout = window.setTimeout(() => {
    cleanup();
    onStatus({
      requestId,
      status: "error",
      error: "The SELF browser extension request timed out.",
    });
  }, timeoutMs);

  const handleMessage = (event: MessageEvent<unknown>) => {
    if (event.source !== window || !isBridgeResponse(event.data)) return;
    if (
      event.data.type === EXTENSION_BRIDGE.messages.status &&
      event.data.requestId === requestId &&
      event.data.status
    ) {
      if (
        event.data.status === "approved" ||
        event.data.status === "rejected" ||
        event.data.status === "error"
      ) {
        isSettled = true;
        window.clearTimeout(timeout);
      }
      onStatus({
        requestId,
        status: event.data.status,
        error: event.data.error,
      });
    }
  };

  window.addEventListener("message", handleMessage);
  const bridgeRequest: ExtensionBridgeRequest = {
    source: SDK_SOURCE,
    version: BRIDGE_VERSION,
    type: EXTENSION_BRIDGE.messages.signIn,
    requestId,
    payload: request,
  };
  window.postMessage(bridgeRequest, window.location.origin);

  const cleanup = () => {
    window.clearTimeout(timeout);
    window.removeEventListener("message", handleMessage);
    if (isSettled) return;
    isSettled = true;
    const cancelRequest: ExtensionBridgeRequest = {
      source: SDK_SOURCE,
      version: BRIDGE_VERSION,
      type: EXTENSION_BRIDGE.messages.cancel,
      requestId,
    };
    window.postMessage(cancelRequest, window.location.origin);
  };

  return cleanup;
};
