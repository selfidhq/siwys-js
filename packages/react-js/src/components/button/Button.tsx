import React from "react";

import styled from "styled-components";

export type ColorTheme = "auto" | "light" | "dark";

const StyledButton = styled.button<{ $colorTheme: ColorTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 17.625rem;
  height: 3rem;
  border-radius: 60px;
  border: none;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    box-shadow: 0px 0px 42px rgba(255, 255, 255, 0.5);
  }

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
    } else {
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
    <StyledButton type="button" onClick={onClick} $colorTheme={colorTheme}>
      {children}
    </StyledButton>
  );
};

export default Button;
