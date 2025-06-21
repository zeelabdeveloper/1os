import React from "react";
import { HiExclamationCircle } from "react-icons/hi"; // Heroicon from react-icons

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #1e3a8a, #111827)", // Blue to dark
            color: "#f9fafb",
            fontFamily: "'Segoe UI', sans-serif",
            padding: "2rem",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "1.5rem",
              padding: "3rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
              textAlign: "center",
              maxWidth: "500px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            }}
          >
            <HiExclamationCircle  size={64} color="#facc15" style={{ marginBottom: "1rem" ,margin:'auto'    }} />
            <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
              Oops! Something went wrong.
            </h1>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "2rem" }}>
              We encountered an unexpected error. Please try again later or contact support.
            </p>
            {this.state.error?.message && (
              <p
                style={{
                  background: "rgba(255,255,255,0.1)",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.95rem",
                  color: "#e5e7eb",
                }}
              >
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
