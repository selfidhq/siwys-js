import React from "react";

import styles from "./Button.module.css";

export type ColorTheme = "auto" | "light" | "dark";

interface ButtonProps {
  children: string | React.ReactNode;
  onClick: () => void;
  colorTheme?: ColorTheme;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  colorTheme = "auto",
}) => {
  return (
    <button
      type="button"
      className={styles[`${colorTheme}-button`]}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
