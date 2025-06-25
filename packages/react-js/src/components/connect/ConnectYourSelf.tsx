import React from "react";
import SignInWithYourSelf from "../signin/SignInWithYourSelf";

interface ConnectYourSelfProps {
  challengeDID: string;
  challengeBaseUrl?: string;
  onConnectPress: () => void;
}

const ConnectYourSelf: React.FC<ConnectYourSelfProps> = ({
  challengeBaseUrl,
  challengeDID,
  onConnectPress,
}) => {
  return (
    <SignInWithYourSelf
      challengeBaseUrl={challengeBaseUrl}
      challengeDID={challengeDID}
      onSiwysPress={onConnectPress}
      isCYS
    />
  );
};

export default ConnectYourSelf;
