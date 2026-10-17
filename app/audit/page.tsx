"use client";

import { useState } from "react";
import Link from "next/link";

type Fantome = { nom: string; mensuel: number; annuel: number; fois: number; dernier: string };

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

function analyser(texte: string): Fantome[] | string {
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
  for (const r of rows.slice(1)) {
    const desc = (r[iDesc] || "").trim();
    const montant = parseFloat((r[iMont] || "").replace(",", "."));
    const t = date(r[iDate] || "");
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
  const res: Fantome[] = [];
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
    res.push({
      nom: g.nom,
      mensuel: med,
      annuel: med * 12,
      fois: g.t.length,
      dernier: new Date(ts[ts.length - 1]).toLocaleDateString("fr-FR"),
    });
  });
  return res.sort((a, b) => b.annuel - a.annuel);
}

const eur = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

export default function Audit() {
  const [liste, setListe] = useState<Fantome[] | null>(null);
  const [erreur, setErreur] = useState("");

  function choisir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErreur("");
    setListe(null);
    const lecteur = new FileReader();
    lecteur.onload = () => {
      try {
        const r = analyser(String(lecteur.result || ""));
        if (typeof r === "string") setErreur(r);
        else setListe(r);
      } catch {
        setErreur("Impossible de lire ce fichier.");
      }
    };
    lecteur.onerror = () => setErreur("Impossible de lire ce fichier.");
    lecteur.readAsText(f);
  }

  const total = liste ? liste.reduce((s, x) => s + x.annuel, 0) : 0;

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

      {liste && liste.length === 0 && (
        <p style={{ marginTop: "1.5rem" }}>Aucun prélèvement régulier trouvé. Essaie un relevé sur 12 mois.</p>
      )}

      {liste && liste.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <div className="chiffre">{eur(total)}</div>
          <p>par an, pour {liste.length} prélèvement{liste.length > 1 ? "s" : ""} régulier{liste.length > 1 ? "s" : ""}.</p>
          <ul style={{ listStyle: "none", margin: "1.5rem 0 0", padding: 0, display: "grid", gap: "1rem" }}>
            {liste.map((x) => (
              <li key={x.nom} style={{ borderTop: "1px solid #ffffff1f", paddingTop: "1rem" }}>
                <div style={{ fontWeight: 700 }}>{x.nom}</div>
                <div style={{ color: "var(--brique)", fontFamily: "var(--font-titre), Georgia, serif", fontWeight: 800, fontSize: "1.6rem" }}>
                  {eur(x.annuel)} par an
                </div>
                <div style={{ opacity: 0.7, fontSize: ".9rem" }}>
                  {eur(x.mensuel)} par mois · vu {x.fois} fois · dernier : {x.dernier}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
