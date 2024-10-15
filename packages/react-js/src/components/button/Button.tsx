import React from "react";

import styles from "./Button.module.css";

export type ColorTheme = "auto" | "light" | "dark";

interface ButtonProps {
  colorTheme: ColorTheme;
  children: string | React.ReactNode;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({
  colorTheme = "auto",
  children,
  onClick,
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
