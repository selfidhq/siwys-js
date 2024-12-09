import * as React from "react";
import type { SVGProps } from "react";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingIcon = styled.svg`
  animation: ${rotate} 2s linear infinite;
  transform-origin: center;
`;

const LoadingIndicator = (
  props: SVGProps<SVGSVGElement> & { fill?: string }
) => (
  <LoadingIcon
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M20.6121 12C21.9447 12 23.0511 10.9073 22.7646 9.60581C22.374 7.83117 21.5521 6.16649 20.3561 4.76626C18.6336 2.74969 16.248 1.41398 13.6285 0.999404C11.009 0.584833 8.32754 1.11862 6.06649 2.50474C3.80545 3.89085 2.11325 6.03832 1.2943 8.56081C0.475348 11.0833 0.583411 13.8152 1.59905 16.2652C2.61468 18.7151 4.47122 20.7222 6.83469 21.9254C9.19815 23.1286 11.9134 23.4489 14.492 22.8287C16.2824 22.3981 17.9254 21.5336 19.284 20.3269C20.2803 19.4419 20.0267 17.9076 18.9482 17.1248C17.8697 16.342 16.3722 16.6368 15.2436 17.3454C14.6683 17.7066 14.0341 17.9753 13.3634 18.1366C11.9022 18.4881 10.3634 18.3065 9.02407 17.6247C7.6847 16.9428 6.63259 15.8054 6.05703 14.4171C5.48147 13.0287 5.42023 11.4805 5.88433 10.051C6.34843 8.62151 7.3074 7.40454 8.58874 6.61903C9.87007 5.83352 11.3897 5.53102 12.8741 5.76596C14.3586 6.00089 15.7105 6.75784 16.6867 7.90064C17.1347 8.42516 17.4901 9.01516 17.7435 9.64536C18.2406 10.8818 19.2794 12 20.6121 12Z"
      fill={props.fill || "black"}
    />
  </LoadingIcon>
);
export default LoadingIndicator;
