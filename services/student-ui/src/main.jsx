import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const CORE_BACKEND_URL = import.meta.env.VITE_CORE_BACKEND_URL || "http://localhost:3000";
const REPORT_PROCESSOR_URL = import.meta.env.VITE_REPORT_PROCESSOR_URL || "http://localhost:3002";

const tabs = ["Debug Code", "Analyse Circuit", "Lab Report"];

function App() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [theme, setTheme] = useState("dark");
  const isLight = theme === "light";

  return (
    <main className="app-shell" data-theme={theme}>
      <header className="app-header">
        <div>
          <p className="eyebrow">Localhost AI Lab Assistant</p>
          <h1>Student Lab Workbench</h1>
        </div>
        <button
          aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
          aria-pressed={isLight}
          className="theme-toggle"
          onClick={() => setTheme(isLight ? "dark" : "light")}
          type="button"
        >
          <span className="theme-toggle-track">
            <span className="theme-toggle-thumb" />
          </span>
          <span className="theme-toggle-text">{isLight ? "Light" : "Dark"}</span>
        </button>
      </header>

      <nav className="tabs" aria-label="Lab assistant tools">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "Debug Code" && <DebugCode />}
      {activeTab === "Analyse Circuit" && <AnalyseCircuit />}
      {activeTab === "Lab Report" && <LabReport />}
    </main>
  );
}

function DebugCode() {
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("language", language);
      if (file) {
        form.append("file", file);
      } else {
        form.append("code", code);
      }

      const response = await fetch(`${CORE_BACKEND_URL}/upload/code`, {
        method: "POST",
        body: form,
      });
      const data = await readJson(response);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>
          Language
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option>MATLAB</option>
            <option>Arduino</option>
            <option>Python</option>
            <option>C</option>
          </select>
        </label>
        <label>
          Code
          <textarea
            value={code}
            disabled={Boolean(file)}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Paste lab code for static analysis"
          />
        </label>
        <label>
          Or upload source file
          <span className="upload-zone">
            <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </span>
        </label>
        <button disabled={loading || (!code.trim() && !file)} type="submit">
          {loading ? "Analysing..." : "Debug Code"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results">
        <h2>Annotated Bugs</h2>
        {!result && <p className="empty">Results appear here after analysis.</p>}
        {result?.bugs?.map((bug, index) => (
          <article className="bug-item" key={`${bug.title}-${index}`}>
            <div>
              <strong>{bug.title || "Issue"}</strong>
              <span className={`bug-badge ${badgeClass(bug.severity)}`}>{bug.severity || "info"}</span>
            </div>
            {bug.line && <p className="muted">Line: {bug.line}</p>}
            <p>{bug.description}</p>
          </article>
        ))}
        {Boolean(result?.fixes?.length) && <h3>Fixes</h3>}
        {result?.fixes?.map((fix, index) => (
          <article className="fix-item" key={`${fix.title}-${index}`}>
            <strong>{fix.title}</strong>
            <div className="fix-compare">
              <div className="fix-pane before">
                <span>Before</span>
                <p>{fix.description}</p>
              </div>
              <div className="fix-pane after">
                <span>After</span>
                {fix.code ? <pre>{fix.code}</pre> : <p>{fix.description}</p>}
              </div>
            </div>
          </article>
        ))}
        {Boolean(result?.explanations?.length) && <h3>Explanations</h3>}
        {result?.explanations?.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </section>
    </section>
  );
}

function AnalyseCircuit() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("image", image);
      const response = await fetch(`${CORE_BACKEND_URL}/upload/circuit`, {
        method: "POST",
        body: form,
      });
      const data = await readJson(response);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>
          Circuit image
          <span className="upload-zone">
            <input accept="image/*" type="file" onChange={(event) => setImage(event.target.files?.[0] || null)} />
          </span>
        </label>
        {previewUrl && <img className="preview" src={previewUrl} alt="Circuit preview" />}
        <button disabled={loading || !image} type="submit">
          {loading ? "Analysing..." : "Analyse Circuit"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results">
        <h2>Components</h2>
        {!result && <p className="empty">Detected components appear here.</p>}
        {Boolean(result?.components?.length) && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {result.components.map((component, index) => (
                <tr className="component-row" key={`${component.name}-${index}`}>
                  <td>{component.name}</td>
                  <td>{component.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}

function LabReport() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${REPORT_PROCESSOR_URL}/process/report`, {
        method: "POST",
        body: form,
      });
      const data = await readJson(response);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const templateEntries = Object.entries(result?.template || {});

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>
          Lab report PDF or image
          <span className="upload-zone">
            <input
              accept="application/pdf,image/*"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </span>
        </label>
        <button disabled={loading || !file} type="submit">
          {loading ? "Processing..." : "Process Report"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results">
        <h2>Report Template</h2>
        {!result && <p className="empty">Template sections and viva questions appear here.</p>}
        {templateEntries.map(([key, value]) => (
          <article className={`template-section section-${key}`} key={key}>
            <h3>{titleCase(key)}</h3>
            <p>{value}</p>
          </article>
        ))}
        {Boolean(result?.viva_questions?.length) && <h2>Viva Q&A</h2>}
        {result?.viva_questions?.map((item, index) => (
          <details className="viva-item" key={`${item.q}-${index}`}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </section>
  );
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Request failed");
  }
  return data;
}

function titleCase(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function badgeClass(value = "") {
  const normalized = value.toLowerCase();
  if (normalized.includes("error") || normalized.includes("high")) return "badge-error";
  if (normalized.includes("warn") || normalized.includes("medium")) return "badge-warning";
  return "badge-info";
}

createRoot(document.getElementById("root")).render(<App />);
