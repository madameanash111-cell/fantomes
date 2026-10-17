import { ImageResponse } from "next/og";

export const alt = "Fantômes — Débusque les abonnements que tu paies sans t’en servir";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", background: "#14110f", color: "#f4efe6", padding: 80 }}>
        <div style={{ display: "flex", fontSize: 44, color: "#c49a6c", fontWeight: 700 }}>Fantômes</div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, marginTop: 24, lineHeight: 1.1 }}>
          Tu paies des abonnements que tu n’utilises plus.
        </div>
        <div style={{ display: "flex", fontSize: 40, color: "#c8452d", marginTop: 32 }}>
          Débusque-les en quelques secondes.
        </div>
      </div>
    ),
    size
  );
}
