import Link from "next/link";

function Fantome() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 28V14a10 10 0 0 1 20 0v14l-3.4-3-3.3 3-3.3-3-3.3 3-3.4-3z" />
      <circle cx="12.5" cy="14" r="1.2" fill="currentColor" />
      <circle cx="19.5" cy="14" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <main className="wrap">
        <section className="hero">
          <div className="marque"><Fantome /> Fantômes</div>
          <h1 className="titre">Tu paies des abonnements que tu n’utilises plus.</h1>
          <p>Dépose ton relevé : on débusque les prélèvements oubliés, classés par ce qu’ils te coûtent chaque année.</p>
          <Link href="/commencer" className="btn">Commencer, c’est gratuit</Link>
          <p className="note">Ton relevé reste sur ton téléphone. Rien n’est envoyé.</p>
        </section>

        <section className="douleur">
          <div className="chiffre">120 €</div>
          <p>C’est ce que coûte, en un an, un seul abonnement à 9,99 € par mois que tu n’ouvres plus. Trop petit pour se voir sur un relevé, assez grand pour payer des vacances.</p>
        </section>

        <ul className="benefices">
          <li>
            <h2 className="titre">On les repère pour toi</h2>
            <p>Un essai jamais résilié, un service remplacé, une option activée une fois : tout ce qui se répète est listé.</p>
          </li>
          <li>
            <h2 className="titre">Classés par montant annuel</h2>
            <p>Pas 4 € par mois, mais 48 € par an. Tu vois tout de suite ce qui vaut la peine d’être arrêté.</p>
          </li>
          <li>
            <h2 className="titre">La lettre est déjà écrite</h2>
            <p>Pour chaque abonnement, une lettre de résiliation prête à envoyer. Tu n’as rien à rédiger.</p>
          </li>
        </ul>

        <section className="final">
          <Link href="/commencer" className="btn">Commencer, c’est gratuit</Link>
          <p className="note">Satisfait ou remboursé 14 jours, sur simple email.</p>
        </section>
      </main>

      <footer className="pied">
        <div className="wrap">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/cgv">CGV</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </div>
      </footer>
    </>
  );
}
