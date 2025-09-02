import { getColorByNegocio, iconForTipo, UPSALE_THRESHOLD, RENEW_WORDS } from "../config/business";
import { parseMoney, primaryNegocioFrom, chooseDateForItem } from "../utils/format";

/**
 * Recebe o array bruto vindo da API/JSON e devolve itens prontos pro card:
 * - ordenados
 * - com badges
 * - com bulletColor / bulletIcon
 * - com dateLabel (mês/ano)
 */
export default function normalizeTimeline(raw = []) {
  // 1) mapeia itens base
  const base = raw.map((it) => {
    const { dtSort, dateLabel } = chooseDateForItem(it);
    return {
      raw: it,
      tipo: it.tipo,
      cd_pedido: it.cd_pedido,
      cd_ordem_servico: it.cd_ordem_servico,
      nm_nome: it.nm_nome,
      nm_fantasia: it.nm_fantasia,
      cd_entidade: it.cd_entidade,
      ds_negocio: it.ds_negocio,
      situacao: it.situacao,
      vl_total_em_reais: parseMoney(it.vl_total_em_reais ?? it.vl_total ?? null),
      primaryNegocio: primaryNegocioFrom(it.ds_negocio, it.cd_negocio),
      dt_sort: dtSort,
      dateLabel,
    };
  });

  // 2) ordena
  base.sort((a, b) => (a.dt_sort || 0) - (b.dt_sort || 0));

  // 3) badges + estética dependente de histórico
  const lastByNegocio = {};
  const orderedNegKeys = [];
  let firstMarked = false;

  return base.map((item) => {
    const badges = [];

    // "Primeira compra" só para PEDIDO e apenas na primeira ocorrência
    if (!firstMarked && String(item.tipo || "").toUpperCase() !== "OS") {
      badges.push({ type: "first", title: "Primeira compra", icon: "🏆" });
      firstMarked = true;
    }

    // renovação
    const dsUpper = (item.ds_negocio || "").toUpperCase();
    const isRenew = RENEW_WORDS.some((w) => dsUpper.includes(w)) || String(item.situacao || "") === "2";
    if (isRenew) badges.push({ type: "renewal", title: "Renovação", icon: "🔁" });

    // cross/upsell por negócio
    const pn = item.primaryNegocio;
    const lastNeg = orderedNegKeys.length ? orderedNegKeys[orderedNegKeys.length - 1] : null;

    if (pn && lastNeg && pn !== lastNeg) badges.push({ type: "cross", title: "Cross-sell", icon: "⭐" });

    if (pn && lastByNegocio[pn] && item.vl_total_em_reais != null && lastByNegocio[pn].vl_total_em_reais != null) {
      const lastVal = lastByNegocio[pn].vl_total_em_reais || 0;
      if (item.vl_total_em_reais > lastVal * (1 + UPSALE_THRESHOLD)) {
        badges.push({ type: "upsell", title: "Upsell", icon: "⭐" });
      }
    }

    if (pn && !orderedNegKeys.includes(pn)) orderedNegKeys.push(pn);
    if (pn) lastByNegocio[pn] = item;

    const bulletColor = getColorByNegocio(item.ds_negocio, item.situacao, item.vl_total_em_reais);
    const bulletIcon = iconForTipo(item.tipo);

    return { ...item, badges, bulletColor, bulletIcon };
  });
}
