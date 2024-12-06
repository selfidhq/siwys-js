import React, { useMemo, useState } from "react";

import styled from "styled-components";

import Button, { ButtonProps } from "./Button";
import {
  CircleLogoBlack,
  CircleLogoWhite,
  LoadingIndicator,
  SelfTextLogoBlack,
  SelfTextLogoWhite,
} from "../../icons";

const SignInMessage = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
`;

const StyledButton = styled(Button)`
  width: 305px; // fixed width to support loading indicator
`;

const SignInButton: React.FC<ButtonProps & { type: "signIn" | "connect" }> = ({
  type,
  ...rest
}) => {
  const { colorTheme, onClick } = rest;

  const [clicked, setClicked] = useState<boolean>(false);

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

  const handleClick = () => {
    setClicked(true);
    onClick();
  };

  return (
    <StyledButton {...rest} disabled={clicked} onClick={handleClick}>
      {!clicked && (
        <>
          {showBlackIcons && <CircleLogoBlack width="1.5rem" height="1.5rem" />}
          {!showBlackIcons && <CircleLogoWhite width="2rem" height="2rem" />}
          <SignInMessage>
            <span style={{ fontSize: "1rem" }}>{label}</span>
            {showBlackIcons && <SelfTextLogoBlack width="4rem" />}
            {!showBlackIcons && <SelfTextLogoWhite width="4rem" />}
          </SignInMessage>
        </>
      )}
      {clicked && (
        <LoadingIndicator fill={showBlackIcons ? "black" : "white"} />
      )}
    </StyledButton>
  );
};

const CysButton: React.FC<ButtonProps> = ({ ...props }) => {
  return <SignInButton type="connect" {...props} />;
};

const SiwysButton: React.FC<ButtonProps> = ({ ...props }) => {
  return <SignInButton type="signIn" {...props} />;
};

export { CysButton, SiwysButton };
