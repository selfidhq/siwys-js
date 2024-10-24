import React from "react";

import styled from "styled-components";

import Challenge from "./Challenge";
import DownloadApp from "./DownloadApp";

import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body, #root {
    width: 100svw;
    height: 100svh;
    margin: 0;
  }
`

interface SignInProps {
  challengeUrl: string;
}

const Wrapper = styled.div`
  display: flex;
  justify-self: center;
  justify-content: center;
  align-self: center;
  align-items: center;
  background: radial-gradient(
    circle at 24.1% 68.8%,
    rgb(50, 50, 50) 0%,
    rgb(0, 0, 0) 99.4%
  );
  width: 100%;
  height: 100%;
  font-weight: 700;
  @media (max-width: 767px) {
      padding: 10rem 0;
  }
`;

const ModalWrapper = styled.div`
  display: flex;
  align-self: center;  
  border-radius: 16px;
  border: 1px solid;

  @media (max-width: 767px) {
    flex-direction: column-reverse;  
    border: none;
  }
`;

const InstructionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  flex: 2;
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

const SignInWithYourSelf: React.FC<SignInProps> = ({ challengeUrl }) => {
  return (
    <Wrapper>
      <GlobalStyle/>
      <ModalWrapper>
        <Challenge challengeUrl={challengeUrl} />
        <InstructionsWrapper>
          <div style={{ margin: "2rem 5rem" }}>
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
                <li>Open the SELF app on the device with the app installed.</li>
                <li>
                  Use the scanning feature in the SELF app to scan the QR code.
                </li>
                <li>Approve the connection request within the SELF app.</li>
              </List>
            </InstructionsSet>
            <p style={{ marginTop: "3rem" }}>
                Don't have the <i>SELF</i> app?
            </p>
            <DownloadApp />
          </div>
        </InstructionsWrapper>
      </ModalWrapper>
    </Wrapper>
  );
};

export default SignInWithYourSelf;
