import React from "react";
import SignInWithYourSelf from "../signin/SignInWithYourSelf";
import type { ExtensionBridgeConfig } from "../../extensionBridge";

interface ConnectYourSelfProps {
  challengeDID: string;
  challengeBaseUrl?: string;
  onConnectPress?: () => void;
  extensionConfig?: ExtensionBridgeConfig | false;
}

const ConnectYourSelf: React.FC<ConnectYourSelfProps> = ({
  challengeBaseUrl,
  challengeDID,
  onConnectPress,
  extensionConfig,
}) => {
  return (
    <SignInWithYourSelf
      challengeBaseUrl={challengeBaseUrl}
      challengeDID={challengeDID}
      onSiwysPress={onConnectPress}
      extensionConfig={extensionConfig}
      isCYS
    />
  );
};

export default ConnectYourSelf;
