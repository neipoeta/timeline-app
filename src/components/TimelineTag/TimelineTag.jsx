import React from "react";
import "./TimelineTag.scss";

export default function TimelineTag({ label, variant = "light" }) {
  return <span className={`tag ${variant}`}>{label}</span>;
}
