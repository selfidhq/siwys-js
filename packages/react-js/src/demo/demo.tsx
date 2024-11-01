import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import styled from "styled-components";

import { SignInButton } from "../components/button/SignInButton";
import SignInWithYourSelf from "../components/signin/SignInWithYourSelf";

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
        <SignInButton
          colorTheme="dark"
          glow
          onClick={() => {
            setChallenge(true);
          }}
        />
      )}
      {challenge && (
        <SignInWithYourSelf
          checkAuthUrl="http://localhost:3001/check-auth"
          createChallengeUrl="http://localhost:3001/challenges"
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
