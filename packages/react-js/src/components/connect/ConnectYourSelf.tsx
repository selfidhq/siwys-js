import React from "react";
import SignInWithYourSelf from "../signin/SignInWithYourSelf";
import type {
  ExtensionBridgeConfig,
  ExtensionPartner,
  ExtensionSignInResult,
} from "../../utils/extensionBridge";
import type { RequestedCredential, SignInSession } from "../signin/SignInWithYourSelf";

interface ConnectYourSelfProps {
  challengeDID: string;
  challengeBaseUrl?: string;
  onConnectPress?: () => void;
  extensionConfig?: ExtensionBridgeConfig | false;
  partner?: ExtensionPartner;
  requestedCredentials?: RequestedCredential[];
  onAuthenticated?: (session: SignInSession) => void;
  onExtensionResult?: (result: ExtensionSignInResult) => void;
}

const ConnectYourSelf: React.FC<ConnectYourSelfProps> = ({
  challengeBaseUrl,
  challengeDID,
  onConnectPress,
  extensionConfig,
  partner,
  requestedCredentials,
  onAuthenticated,
  onExtensionResult,
}) => {
  return (
    <SignInWithYourSelf
      challengeBaseUrl={challengeBaseUrl}
      challengeDID={challengeDID}
      onSiwysPress={onConnectPress}
      extensionConfig={extensionConfig}
      partner={partner}
      requestedCredentials={requestedCredentials}
      onAuthenticated={onAuthenticated}
      onExtensionResult={onExtensionResult}
      isCYS
    />
  );
};

export default ConnectYourSelf;
