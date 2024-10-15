import React from "react";

import styled from "styled-components";

export type ColorTheme = "auto" | "light" | "dark";

const StyledButton = styled.button<{ colorTheme: ColorTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 282px;
  height: 48px;
  border-radius: 60px;
  cursor: pointer;
  border: none;

  &:active {
    transform: scale(0.9);
  }

  &:hover {
    box-shadow: 0px 0px 42px rgba(255, 255, 255, 0.5);
  }

  ${(props) => {
    if (props.colorTheme === "light") {
      return `
        background: white;
      `;
    } else if (props.colorTheme === "dark") {
      return `
        background: black;
        color: white;
      `;
    } else {
      return `
        @media (prefers-color-scheme: light) {
          background: white;
        }

        @media (prefers-color-scheme: dark) {
          background: black;
          color: white;
        }
      `;
    }
  }}
`;

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
    <StyledButton type="button" colorTheme={colorTheme} onClick={onClick}>
      {children}
    </StyledButton>
  );
};

export default Button;
