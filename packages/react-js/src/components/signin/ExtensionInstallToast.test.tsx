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
    ).toHaveTextContent(
      "SELF browser extension not detected. Install it to continue."
    );
    expect(screen.queryByRole("button", { name: "Install" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
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

    fireEvent.click(screen.getByRole("button", { name: "Install" }));
    expect(onInstall).toHaveBeenCalledTimes(1);
  });
});
