export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px",
        background: "#14110f",
        color: "#f4efe6",
        fontFamily: "Georgia, serif",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Fantômes</h1>
      <p style={{ fontSize: "1.2rem", marginTop: 12 }}>
        Débusque les abonnements que tu paies sans t’en servir.
      </p>
      <p style={{ opacity: 0.6 }}>Bientôt en ligne.</p>
    </main>
  );
}
