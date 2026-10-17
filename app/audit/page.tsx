"use client";

import { useEffect, useState } from "react";
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

function lettre(x: Fantome, nom: string, adresse: string, ref: string): string {
  const aujourdhui = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return `${nom || "[Ton nom et prénom]"}
${adresse || "[Ton adresse postale]"}

${x.nom}
Service résiliation

Le ${aujourdhui}

Objet : résiliation de mon abonnement${ref ? ` (référence : ${ref})` : ""}

Madame, Monsieur,

Par la présente, je vous informe de ma décision de résilier l’abonnement que j’ai souscrit auprès de vos services${ref ? `, référence client ${ref}` : ""}. Il donne lieu à un prélèvement mensuel d’environ ${eur(x.mensuel)}.

Je vous demande de prendre en compte cette résiliation à la date de réception de ce courrier, ou à l’échéance prévue par mon contrat, et de cesser tout prélèvement à compter de cette date.

Je vous remercie de bien vouloir me confirmer la résiliation par écrit, en précisant la date de fin effective de l’abonnement.

Dans l’attente de votre confirmation, je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.

${nom || "[Ton nom et prénom]"}`;
}

const CLE = "fantomes_resultat";

export default function Audit() {
  const [res, setRes] = useState<Resultat | null>(null);
  const [erreur, setErreur] = useState("");
  const [exclus, setExclus] = useState<string[]>([]);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ref, setRef] = useState("");
  const [copie, setCopie] = useState(false);
  const [paye, setPaye] = useState(false);
  const [attente, setAttente] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState("");

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(CLE);
      if (s) setRes(JSON.parse(s));
    } catch {}
    fetch("/api/acces", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPaye(!!d.paye))
      .catch(() => setPaye(false));
  }, []);

  function choisir(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErreur("");
    setRes(null);
    setExclus([]);
    setOuvert(null);
    const lecteur = new FileReader();
    lecteur.onload = () => {
      try {
        const r = analyser(String(lecteur.result || ""));
        if (typeof r === "string") setErreur(r);
        else {
          setRes(r);
          try { sessionStorage.setItem(CLE, JSON.stringify(r)); } catch {}
        }
      } catch {
        setErreur("Impossible de lire ce fichier.");
      }
    };
    lecteur.onerror = () => setErreur("Impossible de lire ce fichier.");
    lecteur.readAsText(f);
  }

  async function debloquer() {
    setAttente(true);
    setErreurPaiement("");
    try {
      const rep = await fetch("/api/checkout", { method: "POST" });
      const data = await rep.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {}
    setErreurPaiement("Le paiement est indisponible pour le moment. Réessaie dans un instant.");
    setAttente(false);
  }

  function basculer(n: string) {
    setExclus((x) => (x.includes(n) ? x.filter((v) => v !== n) : [...x, n]));
  }

  async function copier(texte: string) {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      setCopie(false);
    }
  }

  const liste = res ? res.actifs : [];
  const gardes = liste.filter((x) => !exclus.includes(x.nom));
  const total = (paye ? gardes : liste).reduce((s, x) => s + x.annuel, 0);
  const champ = { width: "100%", minHeight: "2.75rem", padding: "0 .75rem", background: "#ffffff0d", color: "var(--creme)", border: "1px solid #ffffff40", borderRadius: ".5rem", fontSize: "1rem", marginBottom: ".5rem" } as const;
  const bouton = { marginTop: ".5rem", minHeight: "2.75rem", padding: "0 1rem", background: "transparent", color: "var(--creme)", border: "1px solid #ffffff40", borderRadius: ".5rem", cursor: "pointer", fontSize: ".9rem" } as const;
  const montantStyle = { color: "var(--brique)", fontFamily: "var(--font-titre), Georgia, serif", fontWeight: 800, fontSize: "1.6rem" } as const;

  const visibles = paye ? liste : liste.slice(0, 1);
  const verrouilles = paye ? [] : liste.slice(1);

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

      {res && liste.length === 0 && (
        <p style={{ marginTop: "1.5rem" }}>Aucun prélèvement régulier en cours trouvé. Essaie un relevé sur 12 mois.</p>
      )}

      {res && liste.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <div className="chiffre">{eur(total)}</div>
          <p>par an, pour {paye ? gardes.length : liste.length} prélèvement{(paye ? gardes.length : liste.length) > 1 ? "s" : ""} en cours.</p>
          {res.arretes > 0 && (
            <p style={{ opacity: 0.6, fontSize: ".9rem" }}>
              {res.arretes} abonnement{res.arretes > 1 ? "s" : ""} déjà arrêté{res.arretes > 1 ? "s" : ""}, non compté{res.arretes > 1 ? "s" : ""}.
            </p>
          )}

          <ul style={{ listStyle: "none", margin: "1.5rem 0 0", padding: 0, display: "grid", gap: "1rem" }}>
            {visibles.map((x) => {
              const out = exclus.includes(x.nom);
              const ouv = ouvert === x.nom;
              return (
                <li key={x.nom} style={{ borderTop: "1px solid #ffffff1f", paddingTop: "1rem" }}>
                  <div style={{ opacity: out ? 0.4 : 1 }}>
                    <div style={{ fontWeight: 700 }}>{x.nom}</div>
                    <div style={{ ...montantStyle, textDecoration: out ? "line-through" : "none" }}>{eur(x.annuel)} par an</div>
                    <div style={{ opacity: 0.7, fontSize: ".9rem" }}>
                      {eur(x.mensuel)} par mois · vu {x.fois} fois · dernier : {x.dernier}
                    </div>
                    {x.aVerifier && !out && (
                      <div style={{ color: "var(--caramel)", fontSize: ".9rem", marginTop: ".25rem" }}>
                        À vérifier : vu peu de fois, peut-être un paiement en plusieurs fois.
                      </div>
                    )}
                  </div>
                  {paye ? (
                    <>
                      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                        {!out && (
                          <button type="button" onClick={() => setOuvert(ouv ? null : x.nom)} style={{ ...bouton, background: "var(--caramel)", color: "var(--noir)", border: 0, fontWeight: 700 }}>
                            {ouv ? "Fermer la lettre" : "Écrire la lettre"}
                          </button>
                        )}
                        <button type="button" onClick={() => basculer(x.nom)} style={bouton}>
                          {out ? "Remettre dans la liste" : "Ce n’est pas un abonnement"}
                        </button>
                      </div>
                      {ouv && !out && (
                        <div style={{ marginTop: "1rem" }}>
                          <input style={champ} placeholder="Ton nom et prénom" value={nom} onChange={(e) => setNom(e.target.value)} />
                          <input style={champ} placeholder="Ton adresse postale" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
                          <input style={champ} placeholder="Référence client (si tu l’as)" value={ref} onChange={(e) => setRef(e.target.value)} />
                          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: ".95rem", background: "#ffffff0d", padding: "1rem", borderRadius: ".5rem", margin: ".5rem 0" }}>
                            {lettre(x, nom, adresse, ref)}
                          </pre>
                          <button type="button" onClick={() => copier(lettre(x, nom, adresse, ref))} className="btn" style={{ border: 0, cursor: "pointer" }}>
                            {copie ? "Lettre copiée" : "Copier la lettre"}
                          </button>
                          <p className="note">Envoie-la par courrier recommandé ou par l’espace client du service.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ opacity: 0.6, fontSize: ".9rem", marginTop: ".5rem" }}>Lettre de résiliation : débloque l’audit complet pour l’écrire.</p>
                  )}
                </li>
              );
            })}

            {verrouilles.map((x) => (
              <li key={x.nom} style={{ borderTop: "1px solid #ffffff1f", paddingTop: "1rem" }} aria-hidden="true">
                <div style={{ fontWeight: 700, opacity: 0.5 }}>•••••••••• ••••••</div>
                <div style={{ ...montantStyle, opacity: 0.35 }}>••• € par an</div>
              </li>
            ))}
          </ul>

          {!paye && (
            <div style={{ marginTop: "2rem", border: "1px solid var(--caramel)", borderRadius: ".75rem", padding: "1.25rem" }}>
              <h2 className="titre" style={{ fontSize: "1.4rem", margin: "0 0 .5rem" }}>Voilà ton audit, prêt.</h2>
              <p style={{ margin: "0 0 1rem" }}>
                Tu paies {eur(total)} par an en prélèvements réguliers. Pour 19 € une fois, tu vois chaque ligne
                {verrouilles.length > 0 ? ` (${verrouilles.length} de plus)` : ""} et tu as la lettre de résiliation de chacune, prête à envoyer.
              </p>
              <button type="button" className="btn" onClick={debloquer} disabled={attente} style={{ border: 0, cursor: "pointer" }}>
                {attente ? "Ouverture du paiement…" : "Débloquer pour 19 €"}
              </button>
              {erreurPaiement && <p className="note" style={{ color: "var(--brique)", opacity: 1 }}>{erreurPaiement}</p>}
              <p className="note">Paiement unique, sans abonnement. Satisfait ou remboursé 14 jours, sur simple email à madameanash111@gmail.com.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
