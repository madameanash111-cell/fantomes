"use client";

import { useState } from "react";

export default function BoutonPayer() {
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function payer() {
    setChargement(true);
    setErreur("");
    try {
      const rep = await fetch("/api/checkout", { method: "POST" });
      const data = await rep.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErreur("Le paiement est indisponible pour le moment. Réessaie dans un instant.");
    } catch {
      setErreur("Le paiement est indisponible pour le moment. Réessaie dans un instant.");
    }
    setChargement(false);
  }

  return (
    <>
      <button type="button" className="btn" onClick={payer} disabled={chargement} style={{ border: 0, cursor: "pointer" }}>
        {chargement ? "Ouverture du paiement…" : "Payer 19 €"}
      </button>
      {erreur && <p className="note" style={{ color: "var(--brique)", opacity: 1 }}>{erreur}</p>}
    </>
  );
}
