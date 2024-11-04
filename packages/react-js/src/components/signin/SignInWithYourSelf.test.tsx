import React from "react";
import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";

import { SignInWithYouSelf } from "../..";

const checkAuthUrl = "http//backend/auth";
const createChallengeUrl = "http//backend/challenges";
const challengeDid = "did:challenge";

let fetchMock: any;

const fetchMockImpl = (input: URL) => {
  console.log(`fetch mock url`, input);
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
      <SignInWithYouSelf
        checkAuthUrl={checkAuthUrl}
        createChallengeUrl={createChallengeUrl}
      />
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(createChallengeUrl, {
        method: "POST",
      })
    );
  });

  it("should call the checkAuthUrl after receiving Challenge", async () => {
    jest.useFakeTimers();
    render(
      <SignInWithYouSelf
        checkAuthUrl={checkAuthUrl}
        createChallengeUrl={createChallengeUrl}
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
});
