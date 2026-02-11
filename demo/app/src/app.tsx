import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { SignInWithYourSelf, ConnectYourSelf } from "@yourself_id/react-js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

type Tab = "siwys" | "cys";

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
  gap: 2rem;
  min-height: 100vh;
  padding: 2rem;
  width: 100vw;
  box-sizing: border-box;
`;

const TabBar = styled.div`
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #3d414c;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: ${(props) => (props.$active ? "#ffffff" : "#1a1a2e")};
  color: ${(props) => (props.$active ? "#0F0F10" : "#c4ccd4")};
  transition:
    background 0.2s,
    color 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#ffffff" : "#2a2a3e")};
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  color: #ffffff;
  font-family: "Inter", sans-serif;
`;

const SuccessTitle = styled.h2`
  font-weight: 700;
  margin-bottom: 8px;
`;

const SuccessText = styled.p`
  font-weight: 400;
  font-size: 14px;
  color: #c4ccd4;
`;

const StatusText = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #c4ccd4;
`;

// -- Tab 1: Sign In With YourSelf (fully managed) --

const SiwysTab: React.FC = () => {
  return (
    <SignInWithYourSelf
      challengeDID=""
      createChallengeUrl={`${BACKEND_URL}/challenges`}
      pollForAuthUrl={`${BACKEND_URL}/check-auth`}
      successComponent={
        <SuccessContainer>
          <SuccessTitle>Authenticated!</SuccessTitle>
          <SuccessText>
            You have successfully signed in with your SELF.
          </SuccessText>
        </SuccessContainer>
      }
      showLogo
      showInstructions
    />
  );
};

// -- Tab 2: Connect YourSelf (manually managed) --

interface Challenge {
  challenge: string;
  challengeUrl: string;
}

const CysTab: React.FC = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  const createChallenge = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/challenges`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data: Challenge = await res.json();
      setChallenge(data);
    } catch (err) {
      console.error("Error creating challenge:", err);
      setError("Failed to create challenge. Is the backend running?");
    }
  }, []);

  useEffect(() => {
    createChallenge();
  }, [createChallenge]);

  useEffect(() => {
    if (!challenge || authenticated) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/check-auth?challenge=${challenge.challenge}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          },
        );
        if (res.status === 200) {
          const data = await res.json();
          if (data.match) {
            setAuthenticated(true);
            clearInterval(pollingRef.current);
          }
        }
      } catch {
        // backend not ready yet, keep polling
      }
    }, 5000);

    return () => clearInterval(pollingRef.current);
  }, [challenge, authenticated]);

  const handleConnectPress = useCallback(() => {
    if (challenge?.challengeUrl) {
      window.open(challenge.challengeUrl, "_blank");
    }
  }, [challenge]);

  if (error) {
    return <StatusText>{error}</StatusText>;
  }

  if (authenticated) {
    return (
      <SuccessContainer>
        <SuccessTitle>Connected!</SuccessTitle>
        <SuccessText>You have successfully connected your SELF.</SuccessText>
      </SuccessContainer>
    );
  }

  if (!challenge) {
    return <StatusText>Creating challenge...</StatusText>;
  }

  return (
    <ConnectYourSelf
      challengeDID={challenge.challenge}
      onConnectPress={handleConnectPress}
    />
  );
};

// -- Main App --

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("cys");

  return (
    <Wrapper>
      <TabBar>
        <TabButton
          $active={activeTab === "cys"}
          onClick={() => setActiveTab("cys")}
        >
          Connect YourSelf
        </TabButton>
        <TabButton
          $active={activeTab === "siwys"}
          onClick={() => setActiveTab("siwys")}
        >
          Sign In With YourSelf
        </TabButton>
      </TabBar>

      {activeTab === "siwys" ? <SiwysTab /> : <CysTab />}
    </Wrapper>
  );
};

export default App;
