import React from "react";
import ReactDOMServer from "react-dom/server";

import styled from "styled-components";

import { CircleLogoWhite, QrCodeLogo } from "../../icons";
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

const qrCodeLogoSrc =
  "data:image/svg+xml," +
  encodeURIComponent(
    ReactDOMServer.renderToStaticMarkup(<QrCodeLogo height={20} width={82} />)
  );

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
        size={212}
        level="M"
        style={{ marginTop: "3rem", borderRadius: "16px" }}
        marginSize={3}
        imageSettings={{
          src: qrCodeLogoSrc,
          height: 24,
          width: 104,
          excavate: true,
        }}
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
