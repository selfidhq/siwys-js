import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DownloadApp from "./DownloadApp";

describe("DownloadApp Component", () => {
  beforeEach(() => {
    global.window.open = jest.fn();
  });

  it("should render the 'Get' heading", () => {
    render(<DownloadApp />);
    expect(screen.getByText(/Get/)).toBeInTheDocument();
  });

  it("should render the SELF trademark text", () => {
    render(<DownloadApp />);
    expect(screen.getByText("SELF")).toBeInTheDocument();
    expect(screen.getByText("™")).toBeInTheDocument();
  });

  it("should render 'Available to download now:' text", () => {
    render(<DownloadApp />);
    expect(
      screen.getByText("Available to download now:")
    ).toBeInTheDocument();
  });

  it("should render the Apple App Store icon", () => {
    render(<DownloadApp />);
    expect(screen.getByTestId("apple-store-svg")).toBeInTheDocument();
  });

  it("should render the Google Play Store icon", () => {
    render(<DownloadApp />);
    expect(screen.getByTestId("play-store-svg")).toBeInTheDocument();
  });

  it("should open the iOS App Store link when Apple icon is clicked", async () => {
    render(<DownloadApp />);
    const appleButton = screen.getByTestId("apple-store-svg");
    await userEvent.click(appleButton);
    expect(global.window.open).toHaveBeenCalledWith(
      "https://apps.apple.com/app/id.yourself.selfid",
      "_blank"
    );
  });

  it("should open the Google Play Store link when Google icon is clicked", async () => {
    render(<DownloadApp />);
    const googleButton = screen.getByTestId("play-store-svg");
    await userEvent.click(googleButton);
    expect(global.window.open).toHaveBeenCalledWith(
      "https://play.google.com/store/apps/details?id=prod.id.yourself.selfid",
      "_blank"
    );
  });

  it("should render the CheckerLogo icons", () => {
    const { container } = render(<DownloadApp />);
    const svgs = container.querySelectorAll("svg");
    // At least 4 SVGs: CheckerLogoBlack, CheckerLogoWhite, AppleAppStore, GooglePlayStore
    expect(svgs.length).toBeGreaterThanOrEqual(4);
  });
});
