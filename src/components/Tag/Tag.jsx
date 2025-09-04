import React from "react";
import "./Tag.scss";

export default function Tag({ label, variant = "light" }) {
  return <span className={`tag ${variant}`}>{label}</span>;
}
