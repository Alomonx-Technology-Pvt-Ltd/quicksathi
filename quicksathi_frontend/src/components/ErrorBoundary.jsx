import { Component } from "react";

const RELOAD_FLAG = "qs_chunk_reload";

// A stale hashed chunk after a deploy ("Failed to fetch dynamically imported module") is fixed by one reload.
const isChunkError = (error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    String(error?.message || error)
  );

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (isChunkError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
      return;
    }
    console.error("Unhandled UI error:", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#64748b", marginBottom: 20 }}>Please reload the page. If this keeps happening, contact support.</p>
          <button
            onClick={() => {
              sessionStorage.removeItem(RELOAD_FLAG);
              window.location.reload();
            }}
            style={{ padding: "10px 24px", borderRadius: 999, border: 0, background: "#1a408b", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
