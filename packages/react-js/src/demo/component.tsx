import React from "react";

interface ComponentProps {
  children: React.ReactNode;
  title: string;
}

const Component: React.FC<ComponentProps> = ({ children, title }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>{title}</h1>
      <div style={{ display: "flex", gap: "1rem" }}>{children}</div>
    </div>
  );
};

export default Component;
