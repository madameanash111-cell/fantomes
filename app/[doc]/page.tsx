import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamicParams = false;

const C = (t: string) => `[À COMPLÉTER : ${t}]`;
const MAIL = "madameanash111@gmail.com";

const docs: Record<string, { titre: string; contenu: React.ReactNode }> = {
  "mentions-legales": {
    titre: "Mentions légales",
    contenu: (
      <>
        <h2 className="titre">Éditeur du site</h2>
        <p>Fantômes est édité par {C("nom et prénom")}, {C("statut, ex. micro-entrepreneur")}, SIRET {C("numéro SIRET")}.</p>
        <p>Adresse : {C("adresse postale")}.</p>
        <p>Contact : {MAIL}</p>
        <p>Directeur de la publication : {C("nom et prénom")}.</p>
        <h2 className="titre">Hébergeur</h2>
        <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. vercel.com</p>
        <h2 className="titre">Propriété intellectuelle</h2>
        <p>Les textes, illustrations et le code du site sont la propriété de l’éditeur. Toute reproduction sans autorisation est interdite.</p>
      </>
    ),
  },
  cgv: {
    titre: "Conditions générales de vente",
    contenu: (
      <>
        <h2 className="titre">1. Vendeur</h2>
        <p>{C("nom et prénom")}, SIRET {C("numéro SIRET")}, {C("adresse postale")}. Contact : {MAIL}</p>
        <h2 className="titre">2. Service vendu</h2>
        <p>Fantômes est un outil en ligne qui analyse un relevé bancaire déposé par l’utilisateur, repère les prélèvements réguliers, les classe par montant annuel et génère une lettre de résiliation pour chacun.</p>
        <h2 className="titre">3. Prix</h2>
        <p>Le prix de l’audit complet est de 19 € payés une fois, sans abonnement. {C("mention de TVA, ex. « TVA non applicable, art. 293 B du CGI » si micro-entrepreneur")}</p>
        <h2 className="titre">4. Paiement</h2>
        <p>Le paiement se fait par carte bancaire via Stripe. Les données de carte ne sont jamais vues ni stockées par Fantômes.</p>
        <h2 className="titre">5. Livraison</h2>
        <p>L’accès au résultat complet est ouvert immédiatement après la confirmation du paiement.</p>
        <h2 className="titre">6. Garantie satisfait ou remboursé</h2>
        <p>Tu as 14 jours à compter de l’achat pour demander le remboursement, sans justification. Écris à {MAIL} avec l’email utilisé lors du paiement. Le remboursement est effectué sous 14 jours maximum après ta demande, sur le moyen de paiement utilisé.</p>
        <h2 className="titre">7. Réclamations et médiation</h2>
        <p>Pour toute réclamation, écris à {MAIL}. En cas de litige non résolu, tu peux saisir gratuitement le médiateur de la consommation : {C("nom et coordonnées du médiateur")}.</p>
        <h2 className="titre">8. Droit applicable</h2>
        <p>Les présentes conditions sont soumises au droit français.</p>
      </>
    ),
  },
  confidentialite: {
    titre: "Politique de confidentialité",
    contenu: (
      <>
        <h2 className="titre">Responsable du traitement</h2>
        <p>{C("nom et prénom")}. Contact : {MAIL}</p>
        <h2 className="titre">Ton relevé bancaire</h2>
        <p>Ton relevé est analysé directement dans ton navigateur, sur ton téléphone ou ton ordinateur. Il n’est ni envoyé à nos serveurs, ni stocké.</p>
        <h2 className="titre">Les données que nous recevons</h2>
        <p>Ton adresse email et les informations de paiement nécessaires à ta commande, traitées par Stripe. Base légale : l’exécution du contrat.</p>
        <h2 className="titre">Mesure d’audience</h2>
        <p>Nous mesurons le nombre de visites avec un outil respectueux de la vie privée. {C("nom de l’outil choisi, une fois installé")}</p>
        <h2 className="titre">Hébergement et sous-traitants</h2>
        <p>Vercel (hébergement) et Stripe (paiement). Ces prestataires peuvent traiter des données hors de l’Union européenne, avec des garanties adaptées.</p>
        <h2 className="titre">Tes droits</h2>
        <p>Tu peux demander l’accès, la rectification ou la suppression de tes données en écrivant à {MAIL}. Tu peux aussi saisir la CNIL (cnil.fr).</p>
      </>
    ),
  },
};

export function generateStaticParams() {
  return Object.keys(docs).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  const d = docs[doc];
  return { title: d ? `${d.titre} — Fantômes` : "Fantômes" };
}

export default async function Page({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = docs[doc];
  if (!d) notFound();
  return (
    <main className="wrap" style={{ padding: "2rem 1.25rem 3rem" }}>
      <p><Link href="/" style={{ color: "var(--caramel)" }}>← Retour à l’accueil</Link></p>
      <h1 className="titre" style={{ fontSize: "2rem" }}>{d.titre}</h1>
      {d.contenu}
    </main>
  );
}
