import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import styled from "styled-components";

import { SiwysButton } from "../components/button/SignInButton";
import QRCode from "../components/signin/QrCode";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: radial-gradient(
    circle at 24.1% 68.8%,
    rgb(50, 50, 50) 0%,
    rgb(0, 0, 0) 99.4%
  );
  gap: 5rem;
  height: 100vh;
  width: 100vw;
`;

const Demo: React.FC<{}> = () => {
  const [challenge, setChallenge] = useState<boolean>(false);

  return (
    <Wrapper>
      {!challenge && (
        <SiwysButton
          colorTheme="dark"
          glow
          onClick={() => {
            setChallenge(true);
          }}
        />
      )}
      {challenge && (
        <QRCode
          challengeUrl="http://localhost:3001/challenges"
          size={212}
          level="H"
        />
      )}
    </Wrapper>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.Fragment>
    <Demo />
  </React.Fragment>
);
