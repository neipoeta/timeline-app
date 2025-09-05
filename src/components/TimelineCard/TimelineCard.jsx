import React from "react";
import { VerticalTimelineElement } from "react-vertical-timeline-component";
import Titulo from "../TimelineTitulo/TimelineTitulo";
import Texto from "../TimelineTexto/TimelineTexto";
import Tag from "../TimelineTag/TimelineTag";
import Marcador from "../TimelineMarcadores/TimelineMarcadores"; // <- componente de UM marcador
import "./TimelineCard.scss";

export default function TimelineCard({ item, position = "left" }) {
  const tags = item?.tags || [];

  const contentStyle = {
    background: item?.cor || "#546e7a",
    color: "#fff",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    "--accentColor": item?.cor || "#546e7a", // usado pelo SCSS (data, bordas etc.)
  };

  // mesmo bico do card de antes (vira conforme o lado)
  const arrowStyle =
    position === "right"
      ? { borderRight: `1rem solid ${item?.cor || "#546e7a"}` }
      : { borderLeft: `1rem solid ${item?.cor || "#546e7a"}` };

  return (
    <VerticalTimelineElement
      className="tl-card custom-element"
      contentStyle={contentStyle}
      contentArrowStyle={arrowStyle}
      date={item?.dateLabel || ""}
      dateClassName="date-opposite"
      iconStyle={{ background: item?.cor || "#546e7a", color: "#fff" }}
      icon={
        <img
          src={item?.iconSrc}
          alt="ícone"
          style={{ width: 28, height: 28, filter: "brightness(0) invert(1)" }}
        />
      }
      position={position}
    >
      {!!tags.length && (
        <div className="tags-row">
          {tags.map((t, i) => (
            <Tag key={`${t}-${i}`} label={t} />
          ))}
        </div>
      )}

      <div className="card-header">
        <Titulo dsTipo={item?.dsTipo} numero={item?.titulo} />
        {/* ⬇️ exatamente como no TimelineCard antigo */}
        <div className="marcadores-wrapper">
          {(item?.marcadores || []).map((m, i) => (
            <Marcador key={`${m}-${i}`} tipo={m} />
          ))}
        </div>
      </div>

      {item?.textoHtml && <Texto html={item.textoHtml} />}
    </VerticalTimelineElement>
  );
}
