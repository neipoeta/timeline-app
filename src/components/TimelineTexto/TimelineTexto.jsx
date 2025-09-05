import React from "react";
import "./TimelineTexto.scss";

export default function TimelineTexto({ html }) {
  return <div className="kv" dangerouslySetInnerHTML={{ __html: html }} />;
}
