import React from "react";
import SignInWithYourSelf from "../signin/SignInWithYourSelf";

interface ConnectYourSelfProps {
  challengeUrl: string;
  onConnectPress: () => void;
}

const ConnectYourSelf: React.FC<ConnectYourSelfProps> = ({
  challengeUrl,
  onConnectPress,
}) => {
  return (
    <SignInWithYourSelf
      challengeUrl={challengeUrl}
      onSiwysPress={onConnectPress}
      isCYS
    />
  );
};

export default ConnectYourSelf;
