import React, { useMemo } from "react";

import Button, { ColorTheme } from "./Button";
import {
  CircleLogoBlack,
  CircleLogoWhite,
  SelfTextLogoBlack,
  SelfTextLogoWhite,
} from "../../icons";

interface SignInButtonProps {
  onClick: () => void;
  colorTheme?: ColorTheme;
}

const SignInButton: React.FC<SignInButtonProps> = ({
  onClick,
  colorTheme = "auto",
}) => {
  const darkModeEnabled = useMemo(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }, []);

  const showBlackIcons =
    colorTheme === "light" || (colorTheme === "auto" && !darkModeEnabled);

  return (
    <Button colorTheme={colorTheme} onClick={onClick}>
      {showBlackIcons && <CircleLogoBlack width="1.5rem" height="1.5rem" />}
      {!showBlackIcons && <CircleLogoWhite width="1.5rem" height="1.5rem" />}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: "0.5rem",
        }}
      >
        <span style={{ fontSize: "16px" }}>Sign in with your</span>
        {showBlackIcons && <SelfTextLogoBlack width="4rem" />}
        {!showBlackIcons && <SelfTextLogoWhite width="4rem" />}
      </div>
    </Button>
  );
};

export default SignInButton;
