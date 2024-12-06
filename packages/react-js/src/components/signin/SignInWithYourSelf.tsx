import React, { useEffect, useState } from "react";

import styled from "styled-components";

import Challenge from "./Challenge";
import DownloadApp from "./DownloadApp";

import { createGlobalStyle } from "styled-components";
import Success from "./Success";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
  }
`;

interface SignInProps {
  createChallengeUrl: string;
  checkAuthUrl: string;
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  background: radial-gradient(
    circle at 24.1% 68.8%,
    rgb(50, 50, 50) 0%,
    rgb(0, 0, 0) 99.4%
  );
  border-radius: 16px;
  font-weight: 700;
  @media (max-width: 767px) {
    display: block;
  }
`;

const ModalWrapper = styled.div`
  display: flex;
  border-radius: 16px;
  border: 1px solid #3d414c;

  @media (max-width: 767px) {
    flex-direction: column-reverse;
    border: none;
    padding: 5rem 2rem;
  }
`;

const InstructionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  padding: 2rem 5rem;
  @media (max-width: 767px) {
    padding: 0;
  }
`;

const InstructionsSet = styled.div`
  margin-bottom: 2rem;
`;

const List = styled.ol`
  list-style: decimal;
  line-height: 2rem;
  padding-left: 1.5rem;
  font-weight: 500;
`;

const SignInWithYourSelf: React.FC<SignInProps> = ({
  createChallengeUrl,
  checkAuthUrl,
}) => {
  const [challengeDid, setChallengeDid] = useState<string>("");
  const [challengeUrl, setChallengeUrl] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    fetch(createChallengeUrl, {
      method: "POST",
    })
      .then((resp) => resp.json())
      .then((json) => {
        setChallengeDid(json.challenge);
        setChallengeUrl(json.challengeUrl);
      });
  }, []);

  useEffect(() => {
    if (!challengeDid || isAuthenticated) return;

    const interval = setInterval(async () => {
      fetch(checkAuthUrl + `?challenge=${challengeDid}`)
        .then((resp) => {
          if (resp.status === 200) {
            return resp.json();
          }
          return { match: false };
        })
        .then((json) => {
          if (json.match) {
            setIsAuthenticated(json.match);
          }
        })
        .catch(() => {});
    }, 5000); // every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [challengeDid, isAuthenticated]);

  return (
    <Wrapper>
      <GlobalStyle />
      <ModalWrapper>
        {isAuthenticated && <Success />}
        {!isAuthenticated && (
          <>
            <Challenge challengeUrl={challengeUrl} />
            <InstructionsWrapper>
              <p style={{ marginBottom: "2rem" }}>
                <b>Instructions:</b>
              </p>
              <InstructionsSet>
                If you are signing in on a device that has the SELF app
                installed:
                <List>
                  <li>Tap the SELF.id connect button.</li>
                  <li>Approve the connection request within the SELF app.</li>
                </List>
              </InstructionsSet>
              <InstructionsSet>
                If you are <u>not</u> signing in on a device that has the SELF
                app installed:
                <List>
                  <li>
                    Open the SELF app on the device with the app installed.
                  </li>
                  <li>
                    Use the scanning feature in the SELF app to scan the QR
                    code.
                  </li>
                  <li>Approve the connection request within the SELF app.</li>
                </List>
              </InstructionsSet>
              <p style={{ marginTop: "3rem" }}>
                Don't have the <i>SELF</i> app?
              </p>
              <DownloadApp />
            </InstructionsWrapper>
          </>
        )}
      </ModalWrapper>
    </Wrapper>
  );
};

export default SignInWithYourSelf;
