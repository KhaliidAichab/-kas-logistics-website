"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        boxSizing: "border-box",
        background: "#0b1220",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#e33b40" }}>Something went wrong</h1>

      <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
        An unexpected error occurred. Please try again.
      </p>

      <button
        type="button"
        onClick={() => reset()}
        style={{
          marginTop: "16px",
          padding: "12px 24px",
          border: 0,
          borderRadius: "8px",
          background: "#d53236",
          color: "#ffffff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </main>
  );
}
