import React from "react";

import styled from "styled-components";

import {
  AppleAppStore,
  CheckerLogoBlack,
  CheckerLogoWhite,
  GooglePlayStore,
} from "../../icons";

const Wrapper = styled.div`
  display: inline-block;
  flex-direction: column;
  gap: 1rem;
  background: #121318;
  border: 1px solid #3d414c;
  border-radius: 8px;
  padding: 1.5rem 2rem;
  margin-top: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  color: white;
  white-space: nowrap;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Box = styled.div<{ $background: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 51px;
  width: 51px;
  border: 1px solid #3d414c;
  border-radius: 10px;
  background: ${(props) => props.$background};
`;

const DownloadApp: React.FC<{}> = ({}) => {
  return (
    <Wrapper>
      <Header>
        <h3>
          Get{" "}
          <span style={{ color: "#D8EE4F" }}>
            SELF<sup style={{ fontSize: "0.5rem" }}>&trade;</sup>
          </span>
        </h3>
        <p>Available to download now:</p>
      </Header>
      <Footer>
        <Box $background="white">
          <CheckerLogoBlack width="2rem" height="1rem" />
        </Box>
        <Box $background="black">
          <CheckerLogoWhite width="2rem" height="1rem" />
        </Box>
        <AppleAppStore
          width="8rem"
          height="2.5rem"
          onClick={() => console.log(`TODO: Update with iOS App URL`)}
          style={{ cursor: "pointer" }}
        />
        <GooglePlayStore
          width="8rem"
          height="2.5rem"
          onClick={() => console.log(`TODO: Update with Google Play URL`)}
          style={{ cursor: "pointer" }}
        />
      </Footer>
    </Wrapper>
  );
};

export default DownloadApp;
