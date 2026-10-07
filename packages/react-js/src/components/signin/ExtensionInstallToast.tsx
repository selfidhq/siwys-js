import React from "react";
import styled from "styled-components";
import { FingerprintIcon, QrCodeLogoBlack, QrCodeLogoWhite } from "../../icons";

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
  align-items: center;
  text-align: center;
  gap: 16px;
  box-sizing: border-box;
  width: min(450px, calc(100vw - 32px));
  padding: 24px 28px;
  border: 1px solid
    ${(props) => (props.$theme === "dark" ? "#2a2d36" : "#c4ccd4")};
  border-radius: 20px;
  background: ${(props) => (props.$theme === "dark" ? "#191b20" : "#ffffff")};
  color: ${(props) => (props.$theme === "dark" ? "#ffffff" : "#0f0f10")};
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  font-family: "Inter", sans-serif;

  @media (max-width: 480px) {
    top: 12px;
    right: 12px;
    width: calc(100vw - 24px);
    padding: 20px 16px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const Title = styled.h2<{ $theme: ThemeProp }>`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  color: ${(props) => (props.$theme === "dark" ? "#ffffff" : "#0f0f10")};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;

  @media (max-width: 480px) {
    white-space: normal;
    font-size: 16px;
  }
`;

const LogoWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`;

const Message = styled.p<{ $theme: ThemeProp }>`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: ${(props) => (props.$theme === "dark" ? "#a0a5ad" : "#555965")};
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 4px;
`;

const ActionButton = styled.button<{ $primary?: boolean; $theme: ThemeProp }>`
  flex: 1;
  min-width: 0;
  height: 46px;
  border: ${(props) =>
    props.$primary
      ? "1px solid #acc2fe"
      : `1px solid ${props.$theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "#0f0f10"}`};
  border-radius: 9999px;
  background: ${(props) => (props.$primary ? "#acc2fe" : "transparent")};
  color: ${(props) =>
    props.$primary
      ? "#0f0f10"
      : props.$theme === "dark"
        ? "#ffffff"
        : "#0f0f10"};
  cursor: pointer;
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.4px;

  &:focus-visible {
    outline: 2px solid #acc2fe;
    outline-offset: 2px;
  }
`;

const ExtensionInstallToast: React.FC<ExtensionInstallToastProps> = ({
  theme,
  onCancel,
  onInstall,
}) => {
  const Logo = theme === "dark" ? QrCodeLogoWhite : QrCodeLogoBlack;

  return (
    <Toast
      $theme={theme}
      role="dialog"
      aria-label="SELF browser extension not detected"
    >
      <FingerprintIcon width="24" height="26" />
      <Content>
        <Title $theme={theme}>
          <LogoWrapper>
            <Logo width="74" height="17" />
          </LogoWrapper>
          <span>Browser Extension required!</span>
        </Title>
        <Message $theme={theme}>
          Install now to connect straight from your browser.
        </Message>
      </Content>
      <Actions>
        <ActionButton type="button" $theme={theme} onClick={onCancel}>
          CANCEL
        </ActionButton>
        {onInstall && (
          <ActionButton type="button" $theme={theme} $primary onClick={onInstall}>
            INSTALL EXTENSION
          </ActionButton>
        )}
      </Actions>
    </Toast>
  );
};

export default ExtensionInstallToast;
