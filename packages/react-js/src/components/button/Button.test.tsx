import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button Component", () => {
  it("should render the correct text", () => {
    render(<Button onClick={() => {}}>Click Me!</Button>);
    const buttonElement = screen.getByRole("button", { name: /click me!/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it("should call the onClick handler", () => {
    const onClickSpy = jest.fn();
    render(
      <Button colorTheme="dark" onClick={onClickSpy}>
        Click Me!
      </Button>
    );
    const buttonElement = screen.getByRole("button");
    fireEvent.click(buttonElement);
    expect(onClickSpy).toHaveBeenCalled();
  });

  it("should have the correct style for a light color theme", () => {
    render(
      <Button colorTheme="light" onClick={() => {}}>
        Click Me!
      </Button>
    );
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveStyle("background: white");
    expect(buttonElement).toHaveStyle("color: black");
  });

  it("should have the correct style for a dark color theme", () => {
    render(
      <Button colorTheme="dark" onClick={() => {}}>
        Click Me!
      </Button>
    );
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toHaveStyle("background: black");
    expect(buttonElement).toHaveStyle("color: white");
  });
});
