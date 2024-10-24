import React from "react";

import styled from "styled-components";

import { CircleLogoWhite } from "../../icons";
import { QRCodeSVG } from "qrcode.react";
import { SignInButton } from "../button/SignInButton";

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

const StyledButton = styled(SignInButton)`
  margin-top: 3rem;
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
      <QRCodeSVG
        value={challengeUrl}
        height="14rem"
        width="14rem"
        style={{ marginTop: "3rem" }}
      />
      <StyledButton
        colorTheme="blue"
        onClick={() => console.log("Open SELF App")}
        glow
      />
    </Wrapper>
  );
};

export default Challenge;
