import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import ExtensionInstallToast from "./ExtensionInstallToast";

describe("ExtensionInstallToast", () => {
  it("renders the install message and cancel action", () => {
    const onCancel = jest.fn();
    render(<ExtensionInstallToast theme="dark" onCancel={onCancel} />);

    expect(
      screen.getByRole("dialog", {
        name: "SELF browser extension not detected",
      })
    ).toHaveTextContent("Browser Extension required!");
    expect(
      screen.getByRole("dialog", {
        name: "SELF browser extension not detected",
      })
    ).toHaveTextContent(
      "Install now to connect straight from your browser."
    );
    expect(
      screen.queryByRole("button", { name: "INSTALL EXTENSION" })
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "CANCEL" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders the install action and calls its handler", () => {
    const onCancel = jest.fn();
    const onInstall = jest.fn();
    render(
      <ExtensionInstallToast
        theme="light"
        onCancel={onCancel}
        onInstall={onInstall}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "INSTALL EXTENSION" }));
    expect(onInstall).toHaveBeenCalledTimes(1);
  });
});
