import React, { useMemo } from "react";

import { default as GenericButton, ButtonProps } from "./Button";
import {
  CircleLogoBlack,
  CircleLogoWhite,
  SelfTextLogoBlack,
  SelfTextLogoWhite,
} from "../../icons";
import styled from "styled-components";

const SignInMessage = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
`;

const Button: React.FC<ButtonProps & { type: "signIn" | "connect" }> = ({
  type,
  ...rest
}) => {
  const { colorTheme } = rest;
  const darkModeEnabled = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }, []);

  const showBlackIcons =
    colorTheme === "light" ||
    colorTheme === "blue" ||
    (!colorTheme && !darkModeEnabled);

  const label = type === "signIn" ? "Sign in with your" : "Connect your";

  return (
    <GenericButton {...rest}>
      {showBlackIcons && <CircleLogoBlack width="1.5rem" height="1.5rem" />}
      {!showBlackIcons && <CircleLogoWhite width="2rem" height="2rem" />}
      <SignInMessage>
        <span style={{ fontSize: "1rem" }}>{label}</span>
        {showBlackIcons && <SelfTextLogoBlack width="4rem" />}
        {!showBlackIcons && <SelfTextLogoWhite width="4rem" />}
      </SignInMessage>
    </GenericButton>
  );
};

const ConnectButton: React.FC<ButtonProps> = ({ ...props }) => {
  return <Button type="connect" {...props} />;
};

const SignInButton: React.FC<ButtonProps> = ({ ...props }) => {
  return <Button type="signIn" {...props} />;
};

export { ConnectButton, SignInButton };
