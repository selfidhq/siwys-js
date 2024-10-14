import React from "react";

import styles from "./Button.module.css";

export type ColorTheme = "auto" | "light" | "dark";

interface ButtonProps {
  colorTheme: ColorTheme;
  children: React.ReactNode;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  colorTheme = "auto",
  ...rest
}) => {
  return (
    <button
      type="button"
      className={styles[`${colorTheme}-button`]}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
