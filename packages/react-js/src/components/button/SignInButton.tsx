import React from "react";

import Button, { ColorTheme } from "./Button";
import {
  CircleLogoBlack,
  CircleLogoWhite,
  SelfTextLogoBlack,
  SelfTextLogoWhite,
} from "../../icons";

interface ButtonProps {
  onClick: () => void;
  variant: ColorTheme;
}

const SignInButton: React.FC<ButtonProps> = ({ onClick, variant = "auto" }) => {
  const darkModeEnabled = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const showBlackIcons =
    variant === "light" || (variant === "auto" && !darkModeEnabled);

  return (
    <Button onClick={onClick} colorTheme={variant}>
      {showBlackIcons && <CircleLogoBlack width="1.5rem" height="1.5rem" />}
      {!showBlackIcons && <CircleLogoWhite width="1.5rem" height="1.5rem" />}
      <div style={{ marginLeft: "0.5rem" }}>
        <span>Sign in with your</span>
        {showBlackIcons && <SelfTextLogoBlack width="4rem" />}
        {!showBlackIcons && <SelfTextLogoWhite width="4rem" />}
      </div>
    </Button>
  );
};

export default SignInButton;
