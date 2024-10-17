import React from "react";

import styled from "styled-components";

type ColorTheme = "light" | "dark" | "blue";

export interface ButtonProps {
  onClick: () => void;
  className?: string;
  colorTheme?: ColorTheme;
  glow?: boolean;
}

const StyledButton = styled.button<{
  $colorTheme?: ColorTheme;
  $glow?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3rem;
  width: fit-content;
  border-radius: 60px;
  border: none;
  cursor: pointer;
  padding: 12px 40px 12px 40px;

  &:active {
    transform: scale(0.98);
  }

  ${(props) => {
    if (props.$glow) {
      return `
        &:hover {
          box-shadow: 0px 0px 42px rgba(255, 255, 255, 0.5);
        }
      `;
    }
  }}

  ${(props) => {
    if (props.$colorTheme === "light") {
      return `
        background: white;
        color: black;
      `;
    } else if (props.$colorTheme === "dark") {
      return `
        background: black;
        color: white;
      `;
    } else if (props.$colorTheme === "blue") {
      // TODO: add global styles for things like colors (below)
      return `
        background: #ACC2FE;
        color: black;
      `;
    } else {
      // auto-detect light vs dark mode
      return `
        @media (prefers-color-scheme: light) {
          background: white;
          color: black;
        }

        @media (prefers-color-scheme: dark) {
          background: black;
          color: white;
        }
      `;
    }
  }}
`;

const Button: React.FC<
  ButtonProps & { children: string | React.ReactNode }
> = ({ children, onClick, className, colorTheme, glow }) => {
  return (
    <StyledButton
      type="button"
      role="button"
      className={className}
      onClick={onClick}
      $colorTheme={colorTheme}
      $glow={glow}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
