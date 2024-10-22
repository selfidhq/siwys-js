import React, { useMemo, useState } from "react";
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
  const [challengeUrl, setChallengeUrl] = useState<string>("");
  const [step, setStep] = useState<number>(1);

  return (
    <Wrapper>
      {step === 1 && (
        <SignInButton
          colorTheme="dark"
          glow
          onClick={() => {
            window.open(
              "https://auth.mdip.yourself.dev/api/challenge",
              "_blank"
            );
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <input
          placeholder="Paste challengeUrl"
          onChange={(e) => {
            setStep(0);
            setChallengeUrl(e.target.value);
          }}
        />
      )}
      {challengeUrl && <SignInWithYourSelf challengeUrl={challengeUrl} />}
    </Wrapper>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Demo />
  </React.StrictMode>
);
