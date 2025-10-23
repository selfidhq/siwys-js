import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import QRCode from "./QrCode";
import { CysButton, SiwysButton } from "../button/SignInButton";

import {
  AppleAppStore,
  GooglePlayStore,
  CircleLogoWhite,
  CircleLogoBlack,
  SelfTextLogoWhite,
  SelfTextLogoBlack,
  AppIconDark,
  AppIconLight,
} from "../../icons";

type ThemeProp = "light" | "dark";

interface SignInProps {
  challengeDID: string;
  challengeBaseUrl?: string;
  isCYS?: boolean;
  createChallengeUrl?: string;
  onSiwysPress?: () => void;
  pollForAuthUrl?: string;
  successComponent?: React.ReactNode;
  theme?: ThemeProp;
  showLogo?: boolean;
  showInstructions?: boolean;
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20%;
  padding-bottom: 40px;
  z-index: 10;
  margin-right: 16px;
  margin-left: 16px;
  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 196px;
    padding-bottom: 0px;
    margin-right: 0px;
    margin-left: 0px;
  }
`;

const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;

  @media (min-width: 1024px) {
    padding-bottom: 0;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-bottom: 70px;
  align-items: center;
  margin-top: 24px;
`;

const QRContainer = styled.div<{ $theme: ThemeProp }>`
  margin-bottom: 70px;
  ${(props) => (props.$theme === "dark" ? "border: 10px black solid" : "")};
  ${(props) => (props.$theme === "dark" ? "border-radius: 26px" : "")};
  ${(props) => (props.$theme === "dark" ? "line-height: 0" : "")};
`;

const Title = styled.h4<{ $theme: ThemeProp }>`
  font-family: "Inter", sans-serif;
  margin-top: 0px;
  margin-bottom: 0px;
  font-weight: 400;
  font-size: 20px;
  line-height: 95%;
  color: ${(props) => (props.$theme === "dark" ? "#0F0F10" : "#ffffff")};
  @media (min-width: 1024px) {
    font-size: 28px;
  }
`;

const InstructionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
`;

const InstructionsTitle = styled.h4<{ $theme: ThemeProp }>`
  font-family: "Inter", sans-serif;
  margin-top: 0px;
  margin-bottom: 0px;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.025em;
  color: ${(props) => (props.$theme === "dark" ? "#0F0F10" : "#ffffff")};
`;

const InstructionsSubtitle = styled.p<{ $theme: ThemeProp }>`
  font-family: "Inter", sans-serif;
  margin-top: 0px;
  margin-bottom: 0px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.025em;
  margin-bottom: 8px;
  color: ${(props) => (props.$theme === "dark" ? "#0F0F10" : "#ffffff")};
`;

const InstructionsDescription = styled.ul<{ $theme: ThemeProp }>`
  font-family: "Inter", sans-serif;
  list-style-type: decimal;
  padding-left: 20px;
  margin-top: 0px;
  margin-bottom: 0px;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.025em;
  color: ${(props) => (props.$theme === "dark" ? "#292D36" : "#c4ccd4")};
`;

const InstructionsDescriptionItem = styled.li`
  margin-bottom: 8px;
`;

const DownloadTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const ParentDownloadContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (min-width: 1024px) {
    width: auto;
  }
`;

const DownloadContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #121114;
  border: 1px solid #3d414c;
  border-radius: 8px;
  padding: 20px;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
  @media (min-width: 1024px) {
      padding-left: 53px;
      padding-right: 53px;
      max-width: 446px;
    }
  }
`;

const DownloadContainerFlex = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  @media (min-width: 1024px) {
    gap: 16px;
    align-items: center;
  }
`;

const DownloadAppTitle = styled.p`
  font-family: "Inter", sans-serif;
  font-weight: 500;
  margin-top: 0px;
  margin-bottom: 0px;
  font-size: 15px;
  line-height: 126%;
  letter-spacing: 0.025em;
  max-width: 128px;
  color: #ffffff;
`;

const AppIconsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  @media (min-width: 1024px) {
    gap: 16px;
  }
`;

const SignInWithYourSelf: React.FC<SignInProps> = ({
  challengeDID,
  onSiwysPress,
  isCYS = false,
  createChallengeUrl = undefined,
  pollForAuthUrl = undefined,
  successComponent,
  theme = "light",
  challengeBaseUrl = "",
  showLogo = true,
  showInstructions = true,
}) => {
  const [challengeUrl, setChallengeUrl] = useState<string>(
    challengeBaseUrl
      ? `${challengeBaseUrl}/challenge?challenge=${challengeDID || ""}`
      : `https://www.selfid.link/challenge?challenge=${challengeDID || ""}`
  );
  const [challengeDid, setChallengeDid] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (createChallengeUrl) {
      fetch(createChallengeUrl, {
        method: "POST",
      })
        .then((resp) => resp.json())
        .then((json) => {
          setChallengeDid(json.challenge);
          setChallengeUrl(json.challengeUrl);
        });
    }
  }, [createChallengeUrl]);

  useEffect(() => {
    if (!pollForAuthUrl || !challengeDid || isAuthenticated) return;

    const interval = setInterval(async () => {
      fetch(pollForAuthUrl + `?challenge=${challengeDid}`)
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
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [challengeDid, isAuthenticated, pollForAuthUrl]);

  const redirectToPlayStore = () => {
    const playStoreURL =
      "https://play.google.com/store/apps/details?id=id.selfid";
    window.open(playStoreURL, "_blank");
  };

  const redirectToAppStore = () => {
    const appStoreURL = "https://apps.apple.com/us/app/self-id/id1663745416";
    window.open(appStoreURL, "_blank");
  };

  const defaultSiwysClick = useCallback(() => {
    if (onSiwysPress) {
      onSiwysPress();
      return;
    }

    window.open(challengeUrl, "_blank");
  }, [challengeUrl, onSiwysPress]);

  if (isAuthenticated) {
    return <Wrapper>{successComponent}</Wrapper>;
  }

  return (
    <Wrapper>
      <SignInContainer>
        {showLogo && (
          <>
            {theme === "dark" ? (
              <CircleLogoBlack width="48" height="48" />
            ) : (
              <CircleLogoWhite width="48" height="48" />
            )}
            <TitleContainer>
              <Title $theme={theme}>
                {isCYS ? "Connect your" : "Sign in with your"}
              </Title>
              {theme === "dark" ? (
                <SelfTextLogoBlack width="102" height="22" />
              ) : (
                <SelfTextLogoWhite width="102" height="22" />
              )}
            </TitleContainer>
          </>
        )}
        <QRContainer $theme={theme}>
          <QRCode challengeUrl={challengeUrl} size={200} level="H" />
        </QRContainer>
        {isCYS ? (
          <CysButton colorTheme={theme} onClick={defaultSiwysClick} glow />
        ) : (
          <SiwysButton colorTheme={theme} onClick={defaultSiwysClick} glow />
        )}
      </SignInContainer>

      {showInstructions && (
        <InstructionsContainer>
          <InstructionsTitle $theme={theme}>
            {isCYS
              ? "Connect your SELF™ Guide:"
              : "Sign in with your SELF™ Guide:"}
          </InstructionsTitle>
          <div>
            <InstructionsSubtitle $theme={theme}>
              {isCYS
                ? "If you have the SELF® mobile app:"
                : "If you are signing in on a device that has the SELF® app installed:"}
            </InstructionsSubtitle>
            <InstructionsDescription $theme={theme}>
              <InstructionsDescriptionItem>
                {isCYS
                  ? "Use scanning feature in the SELF® app to scan the QR code."
                  : 'Tap the "Sign in with your SELF™" button.'}
              </InstructionsDescriptionItem>
              <InstructionsDescriptionItem>
                Approve the connection request within the SELF® app.
              </InstructionsDescriptionItem>
            </InstructionsDescription>
          </div>
          <div>
            <InstructionsSubtitle $theme={theme}>
              {isCYS
                ? "If you do not have the SELF® mobile app:"
                : "If you are not signing in on a device that has the SELF® app installed:"}
            </InstructionsSubtitle>
            <InstructionsDescription $theme={theme}>
              <InstructionsDescriptionItem>
                {isCYS
                  ? "Download and open the SELF® ID app from the App Store."
                  : "Open the SELF® app on the device with the app installed."}
              </InstructionsDescriptionItem>
              <InstructionsDescriptionItem>
                Use the scanning feature in the SELF® app to scan the QR code.
              </InstructionsDescriptionItem>
              <InstructionsDescriptionItem>
                Approve the connection request within the SELF® app.
              </InstructionsDescriptionItem>
            </InstructionsDescription>
          </div>
          <ParentDownloadContainer>
            <DownloadTitleContainer>
              <InstructionsTitle $theme={theme}>
                {"Don’t have the"}
              </InstructionsTitle>
              {theme === "dark" ? (
                <SelfTextLogoBlack width="58" height="12" />
              ) : (
                <SelfTextLogoWhite width="58" height="12" />
              )}
              <InstructionsTitle $theme={theme}>{" app?"}</InstructionsTitle>
            </DownloadTitleContainer>
            <DownloadContainer>
              <DownloadContainerFlex>
                <DownloadAppTitle>Available to download now:</DownloadAppTitle>
                <AppIconsContainer>
                  <AppIconDark width="56" height="56" />
                  <AppIconLight width="56" height="56" />
                </AppIconsContainer>
              </DownloadContainerFlex>
              <DownloadContainerFlex>
                <AppleAppStore
                  width="8rem"
                  height="2.5rem"
                  onClick={redirectToAppStore}
                  style={{ cursor: "pointer" }}
                />
                <GooglePlayStore
                  width="8rem"
                  height="2.5rem"
                  onClick={redirectToPlayStore}
                  style={{ cursor: "pointer" }}
                />
              </DownloadContainerFlex>
            </DownloadContainer>
          </ParentDownloadContainer>
        </InstructionsContainer>
      )}
    </Wrapper>
  );
};

export default SignInWithYourSelf;
