import React from "react";
import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";

import { SignInWithYourSelf } from "../..";

const checkAuthUrl = "http//backend/auth";
const createChallengeUrl = "http//backend/challenges";
const challengeDid = "did:challenge";

let fetchMock: any;

const fetchMockImpl = (input: URL) => {
  const url = input.toString();
  if (url.indexOf("/auth") >= 0) {
    return Promise.resolve({
      ok: true,
      json: () => {
        return {
          match: true,
        };
      },
    });
  } else if (url.indexOf("/challenges") >= 0) {
    return Promise.resolve({
      ok: true,
      json: () => {
        return {
          challenge: challengeDid,
          challengeUrl: "http://challenge-url",
        };
      },
    });
  }
};

beforeEach(() => {
  window.fetch = jest.fn().mockImplementation(fetchMockImpl);
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: false,
  }));
  // @ts-ignore
  fetchMock = jest.spyOn(window, "fetch").mockImplementation(fetchMockImpl);
});

describe("SignInWithYourSelf Component", () => {
  it("should call the createChallengeUrl to generate a Challange", async () => {
    render(
      <SignInWithYourSelf
        createChallengeUrl={createChallengeUrl}
        pollForAuthUrl={checkAuthUrl}
      />
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(createChallengeUrl, {
        method: "POST",
      })
    );
  });

  it("should call the auth URL after receiving Challenge", async () => {
    jest.useFakeTimers();
    render(
      <SignInWithYourSelf
        createChallengeUrl={createChallengeUrl}
        pollForAuthUrl={checkAuthUrl}
      />
    );

    expect(fetchMock).not.toHaveBeenCalledWith(checkAuthUrl);
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenLastCalledWith(
          `${checkAuthUrl}?challenge=${challengeDid}`
        );
      },
      { timeout: 6000 }
    );
  });

  it("should not call the auth URL if not configured", async () => {
    jest.useFakeTimers();
    render(<SignInWithYourSelf createChallengeUrl={createChallengeUrl} />);

    await waitFor(
      () => {
        expect(fetchMock).not.toHaveBeenLastCalledWith(
          `${checkAuthUrl}?challenge=${challengeDid}`
        );
      },
      { timeout: 6000 }
    );
  });
});
