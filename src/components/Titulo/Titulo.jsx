import React from "react";
import "./Titulo.scss";

/** Mostra "PEDIDO 611899" (dsTipo + numero) */
export default function Titulo({ dsTipo, numero }) {
  const text = [dsTipo, numero].filter(Boolean).join(" ");
  return <div className="card-title">{text || "—"}</div>;
}
