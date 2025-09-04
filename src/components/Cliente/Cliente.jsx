import React from "react";
import "./Cliente.scss";

export default function Cliente({ logo, titulo }) {
  return (
    <header className="page-title">
      <img className="brand-logo" src={logo} alt="Logo" />
      <span className="client-name">{titulo}</span>
    </header>
  );
}
