import React from "react";

import styled from "styled-components";

import { CircleLogoWhite } from "../../icons";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #3d414c;
  border-radius: 16px;
  padding: 3rem 6rem;

  @media (max-width: 767px) {
    border: none;
  }
`;

const Header = styled.h1`
  color: white;
  font-size: 2rem;
  white-space: nowrap;
`;

const SuccessMessage = styled.p`
  color: white;
  font-size: 4rem;
  margin-top: 2rem;
`;

const Success: React.FC<{}> = () => {
  return (
    <Wrapper>
      <CircleLogoWhite width="4rem" height="4rem" />
      <Header>
        Sign in with your{" "}
        <span style={{ color: "#D8EE4F" }}>
          SELF<sup style={{ fontSize: "1rem" }}>&trade;</sup>
        </span>
      </Header>
      <SuccessMessage>Success</SuccessMessage>
    </Wrapper>
  );
};

export default Success;
