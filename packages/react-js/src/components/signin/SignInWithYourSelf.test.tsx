import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInWithYourSelf } from "../..";

const challengeUrl = "http://challenge-url";
const onSiwysPress = jest.fn();

describe("SignInWithYourSelf Component", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Método obsoleto pero algunas libs lo usan
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    jest.clearAllMocks();
  });

  it("renders the QR code with the provided challenge URL", () => {
    render(
      <SignInWithYourSelf
        challengeUrl={challengeUrl}
        onSiwysPress={onSiwysPress}
      />
    );
    expect(screen.getByTestId("qr-code")).toBeInTheDocument();
  });

  it("calls onSiwysPress when the sign-in button is clicked", async () => {
    render(
      <SignInWithYourSelf
        challengeUrl={challengeUrl}
        onSiwysPress={onSiwysPress}
      />
    );
    const signInButton = screen.getByRole("button", {
      name: /Sign in with your/i,
    });
    await userEvent.click(signInButton);
    expect(onSiwysPress).toHaveBeenCalledTimes(1);
  });

  it("renders CysButton instead of SiwysButton when isCYS is true", () => {
    render(
      <SignInWithYourSelf
        challengeUrl={challengeUrl}
        onSiwysPress={onSiwysPress}
        isCYS
      />
    );
    expect(
      screen.getByRole("button", { name: /Connect your/i })
    ).toBeInTheDocument();
  });

  it("opens the App Store when Apple button is clicked", async () => {
    global.window.open = jest.fn();
    render(
      <SignInWithYourSelf
        challengeUrl={challengeUrl}
        onSiwysPress={onSiwysPress}
      />
    );
    const appStoreButton = screen.getByTestId("apple-store-svg");
    expect(appStoreButton).toBeInTheDocument();
    await userEvent.click(appStoreButton);
    expect(global.window.open).toHaveBeenCalledWith(
      "https://apps.apple.com/us/app/self-id/id1663745416",
      "_blank"
    );
  });

  it("opens the Play Store when Google Play button is clicked", async () => {
    global.window.open = jest.fn();
    render(
      <SignInWithYourSelf
        challengeUrl={challengeUrl}
        onSiwysPress={onSiwysPress}
      />
    );
    const playStoreButton = screen.getByTestId("play-store-svg");
    expect(playStoreButton).toBeInTheDocument();
    await userEvent.click(playStoreButton);
    expect(global.window.open).toHaveBeenCalledWith(
      "https://play.google.com/store/apps/details?id=id.selfid",
      "_blank"
    );
  });
});
