"use client";

import { useState } from "react";
import Link from "next/link";

const questions = [
  {
    titre: "Combien d’abonnements penses-tu avoir ?",
    options: [
      { label: "1 ou 2", valeur: 2 },
      { label: "3 à 5", valeur: 4 },
      { label: "6 ou plus", valeur: 7 },
    ],
  },
  {
    titre: "Quand as-tu relu ton relevé ligne par ligne pour la dernière fois ?",
    options: [
      { label: "Ce mois-ci", valeur: 0 },
      { label: "Il y a plusieurs mois", valeur: 1 },
      { label: "Je ne m’en souviens pas", valeur: 2 },
    ],
  },
  {
    titre: "As-tu déjà oublié de résilier un essai gratuit ?",
    options: [
      { label: "Oui, plusieurs fois", valeur: 2 },
      { label: "Oui, une fois", valeur: 1 },
      { label: "Non, jamais", valeur: 0 },
    ],
  },
];

const eur = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function Commencer() {
  const [etape, setEtape] = useState(0);
  const [reponses, setReponses] = useState<{ label: string; valeur: number }[]>([]);

  function choisir(o: { label: string; valeur: number }) {
    setReponses([...reponses.slice(0, etape), o]);
    setEtape(etape + 1);
  }

  function retour() {
    setEtape(Math.max(0, etape - 1));
  }

  const fini = etape >= questions.length;
  const progression = Math.round((Math.min(etape, questions.length) / questions.length) * 100);

  const bouton = {
    width: "100%",
    minHeight: "3.5rem",
    padding: "0 1.25rem",
    background: "transparent",
    color: "var(--creme)",
    border: "1px solid #ffffff40",
    borderRadius: ".75rem",
    cursor: "pointer",
    fontSize: "1.0625rem",
    textAlign: "left",
    fontFamily: "inherit",
  } as const;

  if (fini) {
    const n = reponses[0]?.valeur ?? 2;
    const cout = n * 5 * 12;
    const releve = reponses[1]?.label ?? "";
    const essai = reponses[2]?.valeur ?? 0;
    return (
      <main className="wrap" style={{ padding: "2.5rem 1.25rem 3rem" }}>
        <div style={{ height: 6, background: "#ffffff1f", borderRadius: 3, marginBottom: "2rem" }}>
          <div style={{ height: 6, width: "100%", background: "var(--caramel)", borderRadius: 3 }} />
        </div>
        <h1 className="titre" style={{ fontSize: "2rem" }}>Voilà ce que tu nous as dit.</h1>
        <p>
          Tu penses avoir <strong>{reponses[0]?.label.toLowerCase()}</strong> abonnement{n > 2 ? "s" : ""}.
          {" "}Ton dernier vrai coup d’œil à ton relevé : <strong>{releve.toLowerCase()}</strong>.
          {essai > 0 ? " Et tu as déjà laissé filer un essai gratuit." : ""}
        </p>
        <div style={{ borderTop: "1px solid #ffffff1f", borderBottom: "1px solid #ffffff1f", padding: "1.5rem 0", margin: "1.5rem 0" }}>
          <div className="chiffre">{eur(cout)}</div>
          <p style={{ margin: ".5rem 0 0", opacity: 0.85 }}>
            par an, c’est un exemple de calcul : {n} abonnements à 5 € par mois seulement. Tes vrais montants
            sont peut-être plus bas, ou plus hauts. Ton relevé te le dira.
          </p>
        </div>
        <p>
          Dépose ton relevé Revolut : en quelques secondes, tu vois tes prélèvements réguliers, classés par
          montant annuel. Le résultat est lu sur ton téléphone, rien n’est envoyé.
        </p>
        <Link href="/audit" className="btn">Déposer mon relevé</Link>
        <p className="note">Gratuit : tu vois ton total et ton premier prélèvement avant de payer quoi que ce soit.</p>
      </main>
    );
  }

  const q = questions[etape];
  return (
    <main className="wrap" style={{ padding: "2.5rem 1.25rem 3rem" }}>
      <div style={{ height: 6, background: "#ffffff1f", borderRadius: 3, marginBottom: "1rem" }}>
        <div style={{ height: 6, width: `${progression}%`, background: "var(--caramel)", borderRadius: 3, transition: "width .3s" }} />
      </div>
      <p style={{ opacity: 0.6, fontSize: ".9rem", margin: "0 0 1.5rem" }}>Question {etape + 1} sur {questions.length}</p>
      <h1 className="titre" style={{ fontSize: "1.8rem", margin: "0 0 1.5rem" }}>{q.titre}</h1>
      <div style={{ display: "grid", gap: ".75rem" }}>
        {q.options.map((o) => (
          <button key={o.label} type="button" onClick={() => choisir(o)} style={bouton}>
            {o.label}
          </button>
        ))}
      </div>
      <p style={{ marginTop: "1.5rem", minHeight: "2.75rem" }}>
        {etape > 0 ? (
          <button type="button" onClick={retour} style={{ background: "transparent", border: 0, color: "var(--caramel)", cursor: "pointer", fontSize: "1rem", padding: ".75rem 0", fontFamily: "inherit" }}>
            ← Question précédente
          </button>
        ) : (
          <Link href="/" style={{ color: "var(--caramel)", display: "inline-block", padding: ".75rem 0" }}>← Retour à l’accueil</Link>
        )}
      </p>
    </main>
  );
}
