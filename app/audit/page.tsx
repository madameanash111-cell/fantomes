"use client";

import { useState } from "react";
import Link from "next/link";

type Fantome = { nom: string; mensuel: number; annuel: number; fois: number; dernier: string; aVerifier: boolean };
type Resultat = { actifs: Fantome[]; arretes: number };

function lire(texte: string): string[][] {
  const t = texte.replace(/^\uFEFF/, "");
  const premiere = t.split(/\r?\n/)[0] || "";
  const cand = ["\t", ";", ","];
  let d = ",";
  let max = -1;
  for (const c of cand) {
    const n = premiere.split(c).length;
    if (n > max) { max = n; d = c; }
  }
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) {
      if (ch === '"' && t[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === d) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

function trouver(entete: string[], mots: string[]): number {
  const e = entete.map((x) => x.toLowerCase().trim());
  for (const m of mots) {
    const i = e.findIndex((x) => x.includes(m));
    if (i >= 0) return i;
  }
  return -1;
}

function date(s: string): number {
  const iso = Date.parse(s.trim().replace(" ", "T"));
  if (!isNaN(iso)) return iso;
  const m = s.trim().match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
  return m ? Date.UTC(+m[3], +m[2] - 1, +m[1]) : NaN;
}

function mediane(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function nettoyer(desc: string): string {
  return desc
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30);
}

function analyser(texte: string): Resultat | string {
  const rows = lire(texte);
  if (rows.length < 2) return "Le fichier semble vide.";
  const h = rows[0];
  const iDesc = trouver(h, ["description"]);
  const iMont = trouver(h, ["montant", "amount"]);
  const iDate = trouver(h, ["date de début", "started", "date"]);
  const iEtat = trouver(h, ["état", "etat", "state"]);
  const iProd = trouver(h, ["produit", "product"]);
  if (iDesc < 0 || iMont < 0 || iDate < 0) {
    return "Je ne reconnais pas les colonnes. Il faut au moins Description, Montant et Date.";
  }
  const groupes = new Map<string, { nom: string; t: number[]; m: number[] }>();
  let derniereDate = 0;
  for (const r of rows.slice(1)) {
    const t = date(r[iDate] || "");
    if (!isNaN(t) && t > derniereDate) derniereDate = t;
    const desc = (r[iDesc] || "").trim();
    const montant = parseFloat((r[iMont] || "").replace(",", "."));
    if (!desc || isNaN(montant) || isNaN(t) || montant >= 0) continue;
    const etat = (r[iEtat] || "").toLowerCase();
    if (iEtat >= 0 && !/termin|complet/.test(etat)) continue;
    const prod = (r[iProd] || "").toLowerCase();
    if (/pargne|saving/.test(prod)) continue;
    if (/pocket|vault/i.test(desc)) continue;
    const cle = nettoyer(desc);
    if (!cle) continue;
    const g = groupes.get(cle) || { nom: desc, t: [], m: [] };
    g.t.push(t);
    g.m.push(Math.abs(montant));
    groupes.set(cle, g);
  }
  const actifs: Fantome[] = [];
  let arretes = 0;
  groupes.forEach((g) => {
    if (g.t.length < 3) return;
    const ts = [...g.t].sort((a, b) => a - b);
    const ecarts: number[] = [];
    for (let i = 1; i < ts.length; i++) ecarts.push((ts[i] - ts[i - 1]) / 86400000);
    const e = mediane(ecarts);
    if (e < 26 || e > 35) return;
    const med = mediane(g.m);
    const proches = g.m.filter((x) => Math.abs(x - med) <= med * 0.2).length;
    if (proches / g.m.length < 0.7) return;
    const dernier = ts[ts.length - 1];
    if ((derniereDate - dernier) / 86400000 > 45) {
      arretes++;
      return;
    }
    actifs.push({
      nom: g.nom,
      mensuel: med,
      annuel: med * 12,
      fois: g.t.length,
      dernier: new Date(dernier).toLocaleDateString("fr-FR"),
      aVerifier: g.t.length <= 4,
    });
  });
  actifs.sort((a, b) => b.annuel - a.annuel);
  return { actifs, arretes };
}

const eur = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

export default function Audit() {
  const [res, setRes] = useState<Resultat | null>(null);
  const [erreur, setErreur] = useState("");
  const [exclus, setExclus] = useState<string[]>([]);

  function choisir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErreur("");
    setRes(null);
    setExclus([]);
    const lecteur = new FileReader();
    lecteur.onload = () => {
      try {
        const r = analyser(String(lecteur.result || ""));
        if (typeof r === "string") setErreur(r);
        else setRes(r);
      } catch {
        setErreur("Impossible de lire ce fichier.");
      }
    };
    lecteur.onerror = () => setErreur("Impossible de lire ce fichier.");
    lecteur.readAsText(f);
  }

  function basculer(nom: string) {
    setExclus((x) => (x.includes(nom) ? x.filter((n) => n !== nom) : [...x, nom]));
  }

  const gardes = res ? res.actifs.filter((x) => !exclus.includes(x.nom)) : [];
  const total = gardes.reduce((s, x) => s + x.annuel, 0);

  return (
    <main className="wrap" style={{ padding: "2.5rem 1.25rem 3rem" }}>
      <p><Link href="/" style={{ color: "var(--caramel)" }}>← Retour à l’accueil</Link></p>
      <h1 className="titre" style={{ fontSize: "2rem" }}>Dépose ton relevé</h1>
      <p>Choisis le fichier CSV exporté depuis Revolut. Il est lu sur ton téléphone : rien n’est envoyé.</p>
      <label className="btn" style={{ cursor: "pointer" }}>
        Choisir mon fichier
        <input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={choisir} style={{ display: "none" }} />
      </label>
      {erreur && <p className="note" style={{ color: "var(--brique)", opacity: 1 }}>{erreur}</p>}

      {res && res.actifs.length === 0 && (
        <p style={{ marginTop: "1.5rem" }}>Aucun prélèvement régulier en cours trouvé. Essaie un relevé sur 12 mois.</p>
      )}

      {res && res.actifs.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <div className="chiffre">{eur(total)}</div>
          <p>par an, pour {gardes.length} prélèvement{gardes.length > 1 ? "s" : ""} en cours.</p>
          {res.arretes > 0 && (
            <p style={{ opacity: 0.6, fontSize: ".9rem" }}>
              {res.arretes} abonnement{res.arretes > 1 ? "s" : ""} déjà arrêté{res.arretes > 1 ? "s" : ""}, non compté{res.arretes > 1 ? "s" : ""}.
            </p>
          )}
          <ul style={{ listStyle: "none", margin: "1.5rem 0 0", padding: 0, display: "grid", gap: "1rem" }}>
            {res.actifs.map((x) => {
              const out = exclus.includes(x.nom);
              return (
                <li key={x.nom} style={{ borderTop: "1px solid #ffffff1f", paddingTop: "1rem", opacity: out ? 0.4 : 1 }}>
                  <div style={{ fontWeight: 700 }}>{x.nom}</div>
                  <div style={{ color: "var(--brique)", fontFamily: "var(--font-titre), Georgia, serif", fontWeight: 800, fontSize: "1.6rem", textDecoration: out ? "line-through" : "none" }}>
                    {eur(x.annuel)} par an
                  </div>
                  <div style={{ opacity: 0.7, fontSize: ".9rem" }}>
                    {eur(x.mensuel)} par mois · vu {x.fois} fois · dernier : {x.dernier}
                  </div>
                  {x.aVerifier && !out && (
                    <div style={{ color: "var(--caramel)", fontSize: ".9rem", marginTop: ".25rem" }}>
                      À vérifier : vu peu de fois, peut-être un paiement en plusieurs fois.
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => basculer(x.nom)}
                    style={{ marginTop: ".5rem", minHeight: "2.75rem", padding: "0 1rem", background: "transparent", color: "var(--creme)", border: "1px solid #ffffff40", borderRadius: ".5rem", cursor: "pointer", fontSize: ".9rem" }}
                  >
                    {out ? "Remettre dans la liste" : "Ce n’est pas un abonnement"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
