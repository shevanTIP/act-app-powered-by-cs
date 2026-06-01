import SwipeStack from "../components/SwipeCard";

export default function SwipeReview() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <span className="label-eyebrow">Review Posts</span>
        <h2 style={{ color: "var(--ink)", marginTop: 6 }}>Approve or discard</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>
          Swipe right to approve, left to discard. Edit any caption inline.
        </p>
      </div>
      <SwipeStack />
    </div>
  );
}
