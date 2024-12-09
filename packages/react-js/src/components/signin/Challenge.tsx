import React from "react";

import styled, { keyframes } from "styled-components";

import { CircleLogoWhite, QrCodeLoading } from "../../icons";
import { SiwysButton } from "../button/SignInButton";
import QRCode from "./QrCode";

interface ChallengeProps {
  challengeUrl: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #3d414c;
  padding: 3rem 6rem;

  @media (max-width: 767px) {
    border: none;
  }
`;

const Header = styled.h1`
  color: white;
  font-size: 2rem;
  white-space: nowrap;
`;

const StyledButton = styled(SiwysButton)`
  margin-top: 3rem;
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 212px;
  height: 212px;

  & > svg {
    animation: ${rotate} 2s linear infinite;
    transform-origin: center;
  }
`;

const Challenge: React.FC<ChallengeProps> = ({ challengeUrl }) => {
  return (
    <Wrapper>
      <CircleLogoWhite width="4rem" height="4rem" />
      <Header>
        Sign in with your{" "}
        <span style={{ color: "#D8EE4F" }}>
          SELF<sup style={{ fontSize: "1rem" }}>&trade;</sup>
        </span>
      </Header>
      {!challengeUrl && (
        <LoadingIcon>
          <QrCodeLoading width="2rem" height="2rem" />
        </LoadingIcon>
      )}
      {challengeUrl && (
        <div style={{ marginTop: "3rem" }}>
          <QRCode challengeUrl={challengeUrl} size={212} level="M" />
        </div>
      )}
      <StyledButton
        colorTheme="blue"
        onClick={() => console.log("Open SELF App")}
        glow
      />
    </Wrapper>
  );
};

export default Challenge;
