import React from "react";
import { HiOutlineEmojiSad } from "react-icons/hi"; // Heroicon

const NotFound = () => {
  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e3a8a)", // dark blue gradient
        color: "#f1f5f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.05)",
          padding: "3rem",
          borderRadius: "1.5rem",
          backdropFilter: "blur(10px)",
          boxShadow: "0 25px 40px rgba(0,0,0,0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        
          <HiOutlineEmojiSad
            size={80}
            color="#facc15"
            style={{ marginBottom: "1rem" , margin:'auto'   }}
          />
         

        <h1
          style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}
        >
          404
        </h1>
        <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Oops! Page not found.
        </p>
        <p style={{ fontSize: "1rem", color: "#cbd5e1", marginBottom: "2rem" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            backgroundColor: "#facc15",
            color: "#0f172a",
            padding: "0.75rem 1.5rem",
            borderRadius: "999px",
            fontWeight: "600",
            textDecoration: "none",
            boxShadow: "0 8px 20px rgba(250, 204, 21, 0.4)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#eab308";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#facc15";
            e.target.style.transform = "scale(1)";
          }}
        >
          Go back Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
