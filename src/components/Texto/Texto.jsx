import React from "react";
import "./Texto.scss";

export default function Texto({ html }) {
  return <div className="kv" dangerouslySetInnerHTML={{ __html: html }} />;
}
