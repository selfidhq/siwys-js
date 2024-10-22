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
`;

const PaddedDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 3rem 6rem;
  height: 100%;
`;

const Header = styled.h1`
  color: white;
  white-space: nowrap;
`;

const StyledButton = styled(SignInButton)`
  margin-top: 3rem;
`;

const Challenge: React.FC<ChallengeProps> = ({ challengeUrl }) => {
  return (
    <Wrapper>
      <PaddedDiv>
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
      </PaddedDiv>
    </Wrapper>
  );
};

export default Challenge;
