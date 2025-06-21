import React from "react";

const Loading = () => {
  return (
    <div style={styles.container}>
      <div style={styles.loader}></div>
      <h2 style={styles.text}>Loading, please wait...</h2>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #4f46e5, #0ea5e9, #22c55e)", // Premium gradient
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#fff",
    padding: "2rem",
  },
  loader: {
    width: "64px",
    height: "64px",
    border: "8px solid rgba(255, 255, 255, 0.2)",
    borderTop: "8px solid #facc15", // yellow
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  text: {
    marginTop: "1.5rem",
    fontSize: "1.25rem",
    fontWeight: 600,
    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
  },
};

// Add the keyframes for the spin animation
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default Loading;
