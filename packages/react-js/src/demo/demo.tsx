import React from "react";
import ReactDOM from "react-dom/client";

import Component from "./component";
import { ConnectButton, SignInButton } from "../components/button/SignInButton";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        background: "silver",
        height: "100vh",
        gap: "2rem",
      }}
    >
      <Component title="Sign In Buttons">
        <SignInButton
          colorTheme="light"
          onClick={() => console.log("Clicked light button!")}
        />
        <SignInButton
          colorTheme="dark"
          glow
          onClick={() => console.log("Clicked dark button!")}
        />
        <SignInButton
          colorTheme="blue"
          onClick={() => console.log("Clicked auto button!")}
        />
      </Component>
      <Component title="Connect Buttons">
        <ConnectButton
          colorTheme="light"
          onClick={() => console.log("Clicked light button!")}
        />
        <ConnectButton
          colorTheme="dark"
          glow
          onClick={() => console.log("Clicked dark button!")}
        />
        <ConnectButton
          colorTheme="blue"
          onClick={() => console.log("Clicked auto button!")}
        />
      </Component>
    </div>
  </React.StrictMode>
);
