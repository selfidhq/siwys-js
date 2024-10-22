import React from "react";

import styled from "styled-components";

import Challenge from "./Challenge";
import DownloadApp from "./DownloadApp";

interface SignInProps {
  challengeUrl: string;
}

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalWrapper = styled.div`
  display: flex;
  align-self: center;

  background: linear-gradient(
    123deg,
    transparent -22.71%,
    rgba(255, 255, 255, 0.06) 70.04%
  );
  border-radius: 16px;
  border: 1px solid;

  @media (max-width: 767px) {
    flex-direction: column-reverse;
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
`;

const SignInWithYourSelf: React.FC<SignInProps> = ({ challengeUrl }) => {
  return (
    <Wrapper>
      <ModalWrapper>
        <Challenge challengeUrl={challengeUrl} />
        <InstructionsWrapper>
          <div style={{ margin: "2rem 5rem" }}>
            <p style={{ marginBottom: "2rem" }}>
              <b>Instructions:</b>
            </p>
            <InstructionsSet>
              <b>
                If you are signing in on a device that has the SELF app
                installed:
              </b>
              <List>
                <li>Tap the SELF.id connect button.</li>
                <li>Approve the connection request within the SELF app.</li>
              </List>
            </InstructionsSet>
            <InstructionsSet>
              <b>
                If you are <u>not</u> signing in on a device that has the SELF
                app installed:
              </b>
              <List>
                <li>Open the SELF app on the device with the app installed.</li>
                <li>
                  Use the scanning feature in the SELF app to scan the QR code.
                </li>
                <li>Approve the connection request within the SELF app.</li>
              </List>
            </InstructionsSet>
            <p style={{ marginTop: "3rem" }}>
              <b>
                Don't have the <i>SELF</i> app?
              </b>
            </p>
            <DownloadApp />
          </div>
        </InstructionsWrapper>
      </ModalWrapper>
    </Wrapper>
  );
};

export default SignInWithYourSelf;
