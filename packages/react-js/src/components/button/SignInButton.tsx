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
  margin-left: 0.5rem;
  font-size: 1rem;
  gap: 0.25rem;
`;

const Button: React.FC<ButtonProps & { type: "signIn" | "connect" }> = ({
  onClick,
  type,
  colorTheme,
}) => {
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
    <GenericButton colorTheme={colorTheme} onClick={onClick}>
      {showBlackIcons && <CircleLogoBlack width="1.5rem" height="1.5rem" />}
      {!showBlackIcons && <CircleLogoWhite width="1.5rem" height="1.5rem" />}
      <SignInMessage>
        {label}
        {showBlackIcons && <SelfTextLogoBlack width="4rem" />}
        {!showBlackIcons && <SelfTextLogoWhite width="4rem" />}
      </SignInMessage>
    </GenericButton>
  );
};

const ConnectButton: React.FC<ButtonProps> = ({ onClick, colorTheme }) => {
  return <Button type="connect" colorTheme={colorTheme} onClick={onClick} />;
};

const SignInButton: React.FC<ButtonProps> = ({ onClick, colorTheme }) => {
  return <Button type="signIn" colorTheme={colorTheme} onClick={onClick} />;
};

export { ConnectButton, SignInButton };
