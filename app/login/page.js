"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
const [isLoading, setIsLoading] = useState(false);
  async function handleSubmit(event) {
  event.preventDefault();
  const cleanEmail = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(cleanEmail)) {
    setMessage("Please enter a valid email address.");
    return;
  }
  if (!password) {
    setMessage("Please enter your password.");
    return;
  }
  if (!supabase) {
    setMessage("Supabase configuration is missing.");
    return;
  }
  setIsLoading(true);
  setMessage("");
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) {
      setMessage(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message
      );
      return;
    }
    window.location.assign("/crm");
  } catch {
    setMessage("Unable to connect. Please try again.");
  } finally {
    setIsLoading(false);
  }
}

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      boxSizing: "border-box",
      background:
        "radial-gradient(circle at top right, #17263d, #0b1220 50%, #070d17)",
      color: "#f8fafc",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "460px",
      boxSizing: "border-box",
      padding: "clamp(24px, 6vw, 40px)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "22px",
      background: "#151f30",
      boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      color: "#e8edf5",
      fontSize: "14px",
      fontWeight: 700,
    },
    input: {
      width: "100%",
      minHeight: "49px",
      padding: "12px 14px",
      boxSizing: "border-box",
      border: "1px solid #39475b",
      borderRadius: "10px",
      background: "#0c1422",
      color: "#ffffff",
      fontSize: "16px",
    },
    button: {
      width: "100%",
      minHeight: "50px",
      border: 0,
      borderRadius: "10px",
      background: "#d53236",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: 700,
      cursor: "pointer",
    },
  };

  return (
    <main style={styles.page}>
      <section
        style={styles.card}
        aria-labelledby="login-title"
      >
        <p
          style={{
            margin: "0 0 10px",
            color: "#e04a4e",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "3px",
          }}
        >
          LOGISTICS BEYOND BORDERS
        </p>

        <h1
          id="login-title"
          style={{
            margin: 0,
            fontSize: "clamp(36px, 9vw, 48px)",
            lineHeight: 1.1,
            letterSpacing: "-1.8px",
          }}
        >
          KAS <span style={{ color: "#d53236" }}>Logistics</span>
        </h1>

        <p
          style={{
            margin: "14px 0 30px",
            color: "#c3ccd8",
            lineHeight: 1.7,
          }}
        >
          Sign in to your account to manage your logistics operations.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: "22px" }}>
            <label htmlFor="email" style={styles.label}>
              Business email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage("");
              }}
              required
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>

            <div style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setMessage("");
                }}
                required
                style={{
                  ...styles.input,
                  paddingRight: "76px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((visible) => !visible)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "8px",
                  border: 0,
                  background: "transparent",
                  color: "#c3ccd8",
                  cursor: "pointer",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          {message && (
            <p
              role="status"
              aria-live="polite"
              style={{
                marginTop: "18px",
                padding: "12px",
                borderRadius: "10px",
                background: "#252f40",
                color: "#e8edf5",
                fontSize: "14px",
                lineHeight: 1.6,
                overflowWrap: "anywhere",
              }}
            >
              {message}
            </p>
          )}
        </form>

        <p
          style={{
            margin: "24px 0 0",
            textAlign: "center",
            color: "#8f9bad",
            fontSize: "12px",
          }}
        >
          Secure access for authorized KAS Logistics users.
        </p>
      </section>
    </main>
  );
}
