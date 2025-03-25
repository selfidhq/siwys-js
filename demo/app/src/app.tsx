import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { SiwysButton, QRCode } from "@yourself_id/react-js";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: radial-gradient(
    circle at 24.1% 68.8%,
    rgb(40, 92, 131) 0%,
    rgb(0, 0, 0) 99.4%
  );
  gap: 5rem;
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 2rem;
  @media (min-width: 1024px) {
    padding-top: 0px;
    padding-bottom: 0px;
  }
  width: 100vw;
`;

const TextContainer = styled.div`
  margin: auto;
  textalign: center;
`;

const Span = styled.span`
  font-weight: 600;
  text-transform: none;
`;

const Title = styled.h4`
  color: black;
  font-weight: 800;
  text-transform: uppercase;
`;

const Subtitle = styled.p`
  color: black;
  font-weight: 800;
  text-transform: uppercase;
`;

interface IChallenge {
  challenge: string;
  challengeUrl: string;
}

interface IUser {
  id: string;
  email: string;
}

const App: React.FC<{}> = () => {
  const [challenge, setChallenge] = useState<IChallenge>();
  const [userDid, setUserDid] = useState<string>();
  const [user, setUser] = useState<IUser>();
  const authPolling = useRef<NodeJS.Timeout>();

  const createChallenge = async () => {
    fetch("http://localhost:3001/challenges", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => setChallenge(data))
      .catch((err) => console.error("Error creating challenge:", err));
  };

  useEffect(() => {
    if (challenge) {
      authPolling.current = setInterval(async () => {
        fetch(
          `http://localhost:3001/check-auth?challenge=${challenge.challenge}`,
          {
            method: "GET",
          }
        )
          .then((res) => res.json())
          .then((data) => {
            console.log("data", data);
            if (data?.match) {
              // challenge has been verified, store userId for registration
              setUserDid(data.responder);
              setUser(data.response);
              return clearInterval(authPolling.current);
            }
          })
          .catch((err) => console.error("Error creating challenge:", err));
      }, 5000);
    }
  }, [challenge]);

  return (
    <Wrapper>
      {user && userDid ? (
        <TextContainer>
          <Title>
            Welcome User Did: <Span>{userDid}</Span>
          </Title>
          <Subtitle>
            Response Did: <Span>{user}</Span>
          </Subtitle>
        </TextContainer>
      ) : (
        <div>
          {!challenge?.challengeUrl && (
            <SiwysButton colorTheme="dark" glow onClick={createChallenge} />
          )}
          {challenge?.challengeUrl && (
            <QRCode
              challengeUrl="http://localhost:3001/challenges"
              size={212}
              level="H"
            />
          )}
        </div>
      )}
    </Wrapper>
  );
};

export default App;
