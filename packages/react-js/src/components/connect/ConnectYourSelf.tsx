import React from "react";
import SignInWithYourSelf from "../signin/SignInWithYourSelf";
import type {
  ExtensionBridgeConfig,
  ExtensionPartner,
  ExtensionSignInResult,
} from "../../utils/extensionBridge";
import type { SignInSession } from "../signin/SignInWithYourSelf";

interface ConnectYourSelfProps {
  challengeDID: string;
  challengeBaseUrl?: string;
  onConnectPress?: () => void;
  extensionConfig?: ExtensionBridgeConfig | false;
  partner?: ExtensionPartner;
  onAuthenticated?: (session: SignInSession) => void;
  onExtensionResult?: (result: ExtensionSignInResult) => void;
}

const ConnectYourSelf: React.FC<ConnectYourSelfProps> = ({
  challengeBaseUrl,
  challengeDID,
  onConnectPress,
  extensionConfig,
  partner,
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
      onAuthenticated={onAuthenticated}
      onExtensionResult={onExtensionResult}
      isCYS
    />
  );
};

export default ConnectYourSelf;
