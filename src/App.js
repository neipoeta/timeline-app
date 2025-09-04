import React, { useEffect, useState } from "react";
import axios from "axios";
import { VerticalTimeline } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

import Cliente from "./components/Cliente/Cliente";
import Linha from "./components/Linha/Linha";
import Card from "./components/Card/Card";

import "./styles/global.scss";

// dados/imagens
import fallbackData from "./config/data.json";
import iconPedido from "./images/ico-24x24-pedidos.png";
import iconOS from "./images/ico-24x24-ordens-de-servico.png";
import iconNS from "./images/ico-24x24-numero-serie.png";
import logoImg from "./images/logo.jpg";

function resolveIconByTipo(tipoCodigo) {
  const t = Number(tipoCodigo);
  if (t === 25) return iconPedido; // Pedido
  if (t === 6)  return iconOS;     // OS
  if (t === 150) return iconNS;    // NS
  return iconPedido;
}

// dd/mm/aaaa
const fmtDateBR = (d) => (d ? d.toLocaleDateString("pt-BR") : "");

function adapt(records) {
  return (records || [])
    .map((r) => {
      const d = r?.data ? new Date(r.data) : null;
      const tags = String(r?.tags || "").split(";").map(s => s.trim()).filter(Boolean);
      const marcadores = String(r?.marcadores || "").split(";").map(s => s.trim()).filter(Boolean);
      return {
        raw: r,
        dateLabel: fmtDateBR(d),
        cor: r?.cor || "#546e7a",
        iconSrc: resolveIconByTipo(r?.tipo),
        dsTipo: r?.ds_tipo,
        titulo: r?.titulo || "",
        textoHtml: String(r?.texto || ""),
        tags,
        marcadores,
      };
    })
    .sort((a, b) => {
      const da = a.raw?.data ? new Date(a.raw.data).getTime() : 0;
      const db = b.raw?.data ? new Date(b.raw.data).getTime() : 0;
      return da - db;
    });
}

export default function App() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const entidade = 23473;

  useEffect(() => {
    let mounted = true;
    const source = axios.CancelToken.source();
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const resp = await axios.get(`/timeline/${entidade}`, {
          timeout: 15000,
          cancelToken: source.token,
        });
        if (mounted) setTimeline(adapt(resp.data || []));
      } catch {
        if (mounted) setTimeline(adapt(fallbackData || []));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; source.cancel("unmount"); };
  }, [entidade]);

  const clientName = timeline.find((it) => it?.raw?.cliente)?.raw?.cliente || "";
  const colors = timeline.map(it => it.cor); // usado pela Linha

  return (
    <div className="app-root">
      <Cliente logo={logoImg} titulo={`Timeline ${clientName}`} />

      {loading && <p className="center">Carregando timeline...</p>}
      {errorMsg && <p className="center error">{errorMsg}</p>}

      {/* Linha envolve a VerticalTimeline para calcular/posicionar o gradiente */}
      <Linha colors={colors}>
        <VerticalTimeline layout="2-columns" lineColor="transparent">
          {timeline.map((item, idx) => (
            <Card
              key={`TL-${idx}`}
              item={item}
              position={idx % 2 === 0 ? "left" : "right"}
            />
          ))}
        </VerticalTimeline>
      </Linha>
    </div>
  );
}
