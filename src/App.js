import React, { useEffect, useState } from "react";
import axios from "axios";
import { VerticalTimeline } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

import "./styles/timeline.scss";
import normalizeTimeline from "./services/normalizeTimeline";
import TimelineCard from "./components/TimelineCard";

// se deixar seu fallback em src/config/data.json, troque o caminho
import fallbackData from "./config/data.json";

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
        if (mounted) setTimeline(normalizeTimeline(resp.data || []));
      } catch {
        if (mounted) {
          setTimeline(normalizeTimeline(fallbackData || []));
          setErrorMsg("Erro ao buscar API — mostrando dados locais (fallback).");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; source.cancel("unmount"); };
  }, [entidade]);

  const clientName =
    timeline?.[0]?.nm_fantasia || timeline?.[0]?.raw?.nm_fantasia || `cd_entidade ${entidade}`;

  return (
    <div className="app-root">
      <h1 className="page-title">
        Timeline — <span className="client-name">{clientName}</span>
      </h1>

      {loading && <p className="center">Carregando timeline...</p>}
      {errorMsg && <p className="center error">{errorMsg}</p>}

      {/* props oficiais: layout / lineColor */}
      <VerticalTimeline layout="2-columns" lineColor="#e9ecef">
        {timeline.map((item, idx) => (
          <TimelineCard
            key={item.tipo === "OS" ? `OS-${item.cd_ordem_servico ?? idx}` : `PD-${item.cd_pedido ?? idx}`}
            item={item}
            position={idx % 2 === 0 ? "left" : "right"}   // alterna L/R
          />
        ))}
      </VerticalTimeline>
    </div>
  );
}
