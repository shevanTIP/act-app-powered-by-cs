import { useState, useEffect, useCallback } from "react";
import { useToast } from "../context/AppContext";

export default function Toast() {
  const [toasts, setToasts] = useState([]);
  const { addToastListener } = useToast();

  const addToast = useCallback((message, type = "default") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, 2800);
  }, []);

  useEffect(() => addToastListener(addToast), [addToastListener, addToast]);

  if (!toasts.length) return null;

  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: t.type === "error" ? "#D62828" : "var(--ink)",
            color: "white",
            padding: "12px 22px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: "0 8px 32px rgba(56,10,101,0.25)",
            whiteSpace: "nowrap",
            animation: t.exiting ? "toastOut 0.35s ease forwards" : "toastIn 0.3s ease",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
