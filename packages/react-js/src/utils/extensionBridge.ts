type ExtensionStatus = "ready" | "pending" | "approved" | "rejected" | "error";

export const EXTENSION_ERROR_CODE = {
  expired: "expired",
  timedOut: "timed_out",
  unavailable: "unavailable",
  failed: "failed",
} as const;

export type ExtensionErrorCode =
  (typeof EXTENSION_ERROR_CODE)[keyof typeof EXTENSION_ERROR_CODE];

export type ExtensionSignInStatus = ExtensionStatus | "unavailable";

export interface ExtensionSignInResult {
  challengeDID: string;
  status: ExtensionSignInStatus;
  code?: ExtensionErrorCode;
  message: string;
}

export interface ExtensionPartner {
  name: string;
  imageUrl?: string;
}

export interface ExtensionBridgeConfig {
  detectionTimeoutMs?: number;
}

interface ExtensionSignInRequest {
  challengeDID: string;
  challengeUrl: string;
  partner?: {
    name: string;
    imageUrl?: string;
  };
}

interface ExtensionStatusMessage {
  requestId: string;
  status: ExtensionStatus;
  error?: string;
  code?: string;
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
const PARTNER_NAME_MAX_LENGTH = 80;
const PARTNER_IMAGE_MAX_LENGTH = 2048;
const REQUEST_EXPIRED_MESSAGE = "The request expired.";
const REQUEST_TIMED_OUT_MESSAGE =
  "The SELF browser extension request timed out.";
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
  code?: string;
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

const isExtensionErrorCode = (value: string): value is ExtensionErrorCode =>
  value === EXTENSION_ERROR_CODE.expired ||
  value === EXTENSION_ERROR_CODE.timedOut ||
  value === EXTENSION_ERROR_CODE.unavailable ||
  value === EXTENSION_ERROR_CODE.failed;

export const extensionErrorCode = (
  error?: string,
  code?: string
): ExtensionErrorCode => {
  if (code && isExtensionErrorCode(code)) {
    return code;
  }
  if (error === REQUEST_EXPIRED_MESSAGE) {
    return EXTENSION_ERROR_CODE.expired;
  }
  if (error === REQUEST_TIMED_OUT_MESSAGE) {
    return EXTENSION_ERROR_CODE.timedOut;
  }
  return EXTENSION_ERROR_CODE.failed;
};

const isSafePartnerImage = (value: string): boolean => {
  if (value.length === 0 || value.length > PARTNER_IMAGE_MAX_LENGTH) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.username || url.password) {
    return false;
  }
  if (url.protocol === "https:") {
    return true;
  }
  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1")
  );
};

export const extensionPartnerPayload = (
  partner?: ExtensionPartner
): ExtensionSignInRequest["partner"] => {
  const name = partner?.name.trim().slice(0, PARTNER_NAME_MAX_LENGTH) ?? "";
  if (!name) {
    return undefined;
  }

  const imageUrl = partner?.imageUrl?.trim() ?? "";
  if (!isSafePartnerImage(imageUrl)) {
    return { name };
  }
  return { name, imageUrl };
};

const extensionResultMessage = (
  status: ExtensionSignInStatus,
  error?: string
): string => {
  if (status === "ready" || status === "pending") {
    return "Approve the request in the SELF browser extension.";
  }
  if (status === "approved") {
    return "Approval received. Completing sign-in...";
  }
  if (status === "rejected") {
    return "The request was rejected in the SELF browser extension.";
  }
  if (status === "unavailable") {
    return "Install the SELF browser extension to continue on this device.";
  }
  return error || "The SELF browser extension could not complete the request.";
};

export const extensionSignInResult = ({
  challengeDID,
  status,
  error,
  code,
}: {
  challengeDID: string;
  status: ExtensionSignInStatus;
  error?: string;
  code?: string;
}): ExtensionSignInResult => {
  const message = extensionResultMessage(status, error);
  if (status === "error") {
    return {
      challengeDID,
      status,
      code: extensionErrorCode(error, code),
      message,
    };
  }
  if (status === "unavailable") {
    return {
      challengeDID,
      status,
      code: EXTENSION_ERROR_CODE.unavailable,
      message,
    };
  }
  return { challengeDID, status, message };
};

export type DesktopExtensionBrowser = "chrome" | "edge" | "firefox" | "safari";

const MOBILE_USER_AGENT = /Android|iPhone|iPad|iPod|Mobile/i;

// TODO: replace these placeholders with published marketplace listings
// before any partner release. Redirects will not land on real listings until then.
export const EXTENSION_STORE_URLS: Record<DesktopExtensionBrowser, string> = {
  chrome: "https://chromewebstore.google.com/detail/self-id-todo",
  edge: "https://microsoftedge.microsoft.com/addons/detail/self-id-todo",
  firefox: "https://addons.mozilla.org/firefox/addon/self-id-todo/",
  safari: "https://apps.apple.com/app/self-id-safari-extension/id0000000000",
};

export const MOBILE_APP_STORE_URLS = {
  ios: "https://apps.apple.com/us/app/self-id/id1663745416",
  android: "https://play.google.com/store/apps/details?id=id.selfid",
} as const;

export const resolveDesktopExtensionBrowser = ():
  | DesktopExtensionBrowser
  | null => {
  if (typeof navigator === "undefined") return null;

  const userAgent = navigator.userAgent;

  if (MOBILE_USER_AGENT.test(userAgent)) return null;
  if (/Edg\//i.test(userAgent)) return "edge";
  if (/Firefox\//i.test(userAgent)) return "firefox";
  if (/Chrome|Chromium|OPR|Brave/i.test(userAgent)) return "chrome";
  if (/Safari/i.test(userAgent) && !/Chrome|Chromium/i.test(userAgent)) {
    return "safari";
  }

  return null;
};

export const resolveMobileAppStoreUrl = (): string | null => {
  if (typeof navigator === "undefined") return null;

  const userAgent = navigator.userAgent;
  if (!MOBILE_USER_AGENT.test(userAgent)) return null;
  if (/Android/i.test(userAgent)) return MOBILE_APP_STORE_URLS.android;
  if (/iPhone|iPad|iPod/i.test(userAgent)) return MOBILE_APP_STORE_URLS.ios;
  return null;
};

export const assignActiveWindow = (url: string): void => {
  window.location.assign(url);
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
      code: EXTENSION_ERROR_CODE.timedOut,
      error: REQUEST_TIMED_OUT_MESSAGE,
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
        code: typeof event.data.code === "string" ? event.data.code : undefined,
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
