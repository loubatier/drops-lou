"use client";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: "48rem",
          margin: "0 auto",
          padding: "2.5rem 1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem" }}>Une erreur est survenue</h1>
        <p>L&apos;application a rencontré un problème inattendu.</p>
        <button type="button" onClick={() => retry()}>
          Réessayer
        </button>
      </body>
    </html>
  );
}
