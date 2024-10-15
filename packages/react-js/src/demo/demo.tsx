import React from "react";
import ReactDOM from "react-dom/client";

import SignInButton from "../components/button/SignInButton";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        background: "grey",
        height: "100vh",
        gap: "2rem",
      }}
    >
      <SignInButton
        colorTheme="light"
        onClick={() => alert("Clicked light button!")}
      />
      <SignInButton
        colorTheme="dark"
        onClick={() => alert("Clicked dark button!")}
      />
    </div>
  </React.StrictMode>
);
