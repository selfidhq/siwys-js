import "@testing-library/jest-dom";
import {
  CysButton,
  SiwysButton,
  SignInWithYourSelf,
  QRCode,
  ConnectYourSelf,
} from "./index";

describe("Package barrel exports", () => {
  it("should export all public components", () => {
    expect(CysButton).toBeDefined();
    expect(SiwysButton).toBeDefined();
    expect(SignInWithYourSelf).toBeDefined();
    expect(QRCode).toBeDefined();
    expect(ConnectYourSelf).toBeDefined();
  });
});
