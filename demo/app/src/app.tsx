import React, { useState } from "react";

import styled from "styled-components";

import { SignInButton, SignInWithYouSelf } from "@selfidhq/react-js";

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

const App: React.FC<{}> = () => {
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
        <SignInWithYouSelf challengeUrl="http://localhost:3001/challenges" />
      )}
    </Wrapper>
  );
};

export default App;
