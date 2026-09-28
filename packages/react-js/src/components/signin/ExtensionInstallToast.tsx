import React from "react";
import styled from "styled-components";

type ThemeProp = "light" | "dark";

interface ExtensionInstallToastProps {
  theme: ThemeProp;
  onCancel: () => void;
  onInstall?: () => void;
}

const Toast = styled.div<{ $theme: ThemeProp }>`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  width: min(420px, calc(100vw - 32px));
  padding: 24px;
  border: 1px solid
    ${(props) => (props.$theme === "dark" ? "#3d414c" : "#c4ccd4")};
  border-radius: 16px;
  background: ${(props) => (props.$theme === "dark" ? "#191b20" : "#ffffff")};
  color: ${(props) => (props.$theme === "dark" ? "#ffffff" : "#0f0f10")};
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28);
  font-family: "Inter", sans-serif;

  @media (max-width: 480px) {
    top: 12px;
    right: 12px;
    width: calc(100vw - 24px);
    padding: 20px;
  }
`;

const Message = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button<{ $primary?: boolean; $theme: ThemeProp }>`
  flex: 1;
  min-width: 0;
  height: 48px;
  border: ${(props) =>
    props.$primary
      ? "1px solid #acc2fe"
      : `1px solid ${props.$theme === "dark" ? "#ffffff" : "#0f0f10"}`};
  border-radius: 24px;
  background: ${(props) => (props.$primary ? "#acc2fe" : "transparent")};
  color: ${(props) =>
    props.$primary
      ? "#0f0f10"
      : props.$theme === "dark"
      ? "#ffffff"
      : "#0f0f10"};
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;

  &:focus-visible {
    outline: 2px solid #acc2fe;
    outline-offset: 2px;
  }
`;

const ExtensionInstallToast: React.FC<ExtensionInstallToastProps> = ({
  theme,
  onCancel,
  onInstall,
}) => (
  <Toast
    $theme={theme}
    role="dialog"
    aria-label="SELF browser extension not detected"
  >
    <Message>
      SELF browser extension not detected. Install it to continue.
    </Message>
    <Actions>
      <ActionButton type="button" $theme={theme} onClick={onCancel}>
        Cancel
      </ActionButton>
      {onInstall && (
        <ActionButton type="button" $theme={theme} $primary onClick={onInstall}>
          Install
        </ActionButton>
      )}
    </Actions>
  </Toast>
);

export default ExtensionInstallToast;
