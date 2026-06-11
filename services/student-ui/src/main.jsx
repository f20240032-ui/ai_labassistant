import React, { useMemo, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import "./styles.css";

const CORE_BACKEND_URL = import.meta.env.VITE_CORE_BACKEND_URL || "http://localhost:3000";
const REPORT_PROCESSOR_URL = import.meta.env.VITE_REPORT_PROCESSOR_URL || "http://localhost:3002";

const tabs = ["Debug Code", "Analyse Circuit", "Lab Report"];
const SUPPORTED_LANGUAGES = ["Python", "MATLAB", "Arduino", "C", "C++", "JavaScript", "Java"];
const RESPONSE_LANGUAGES = [
  { label: "English", value: "English" },
  { label: "हिंदी (Hindi)", value: "Hindi" },
  { label: "తెలుగు (Telugu)", value: "Telugu" },
];
function App() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [theme, setTheme] = useState("dark");
  const [responseLang, setResponseLang] = useState("English");
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const isLight = theme === "light";

  return (
    <main className="app-shell" data-theme={theme}>
      <header className="app-header">
        <div>
          <p className="eyebrow">Localhost AI Lab Assistant</p>
          <h1>Student Lab Workbench</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <select value={responseLang} onChange={(e) => setResponseLang(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "8px", fontWeight: 600 }} aria-label="Response language">
            {RESPONSE_LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <select value={provider} onChange={(e) => { setProvider(e.target.value); setApiKey(""); }}
            style={{ padding: "6px 10px", borderRadius: "8px", fontWeight: 600 }} aria-label="AI provider">
            <option value="gemini">Gemini (Google)</option>
            <option value="groq">Groq (Free/Fast)</option>
          </select>
          <input
            type="password"
            placeholder={provider === "groq" ? "Groq API key (required)" : "Gemini API key (optional)"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "8px", width: "190px" }}
            aria-label="API key"
          />
          <button aria-label={`Switch to ${isLight ? "dark" : "light"} mode`} aria-pressed={isLight}
            className="theme-toggle" onClick={() => setTheme(isLight ? "dark" : "light")} type="button">
            <span className="theme-toggle-track"><span className="theme-toggle-thumb" /></span>
            <span className="theme-toggle-text">{isLight ? "Light" : "Dark"}</span>
          </button>
        </div>
      </header>

      {provider === "groq" && !apiKey && (
        <p style={{ textAlign: "center", color: "#ffc107", marginBottom: "8px", fontSize: "0.85rem" }}>
          ⚠️ Groq requires an API key. Get one free at{" "}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: "#0de2c4" }}>console.groq.com</a>
        </p>
      )}

      <nav className="tabs" aria-label="Lab assistant tools">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab)} type="button">{tab}</button>
        ))}
      </nav>

      {activeTab === "Debug Code" && <DebugCode responseLang={responseLang} provider={provider} apiKey={apiKey} />}
      {activeTab === "Analyse Circuit" && <AnalyseCircuit responseLang={responseLang} provider={provider} apiKey={apiKey} />}
      {activeTab === "Lab Report" && <LabReport responseLang={responseLang} provider={provider} apiKey={apiKey} />}
    </main>
  );
}

function DebugCode({ responseLang, provider, apiKey }) {
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef(null);

  async function submit(event) {
    event.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData();
      form.append("language", language);
      form.append("response_language", responseLang);
      form.append("provider", provider);
      if (apiKey) form.append("api_key", apiKey);
      if (file) { form.append("file", file); } else { form.append("code", code); }
      const response = await fetch(`${CORE_BACKEND_URL}/upload/code`, { method: "POST", body: form });
      setResult(await readJson(response));
    } catch (err) { setError(formatErrorMessage(err)); }
    finally { setLoading(false); }
  }

  const handleCopy = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };
  const handleExport = async (format) => {
    if (!result) return;
    if (format === "text") { downloadFile(new Blob([generateTextReport(result)], { type: "text/plain" }), "debug-report.txt"); }
    else { await exportToPDF(resultsRef, "debug-report.pdf"); }
  };

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>Language
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {SUPPORTED_LANGUAGES.map((lang) => <option key={lang}>{lang}</option>)}
          </select>
        </label>
        <label>Code
          <textarea value={code} disabled={Boolean(file)} onChange={(e) => setCode(e.target.value)} placeholder="Paste lab code for static analysis" />
        </label>
        <label>Or upload source file
          <span className="upload-zone"><input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></span>
        </label>
        <button disabled={loading || (!code.trim() && !file)} type="submit">{loading ? "Analysing..." : "Debug Code"}</button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>Annotated Bugs & Fixes</h2>
          {result && <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport("text")}>📄 Text</button>
            <button className="export-btn" onClick={() => handleExport("pdf")}>📕 PDF</button>
          </div>}
        </div>
        {!result && <p className="empty">Results appear here after analysis.</p>}
        {result?.bugs?.map((bug, i) => (
          <article className="bug-item" key={i}>
            <div className="bug-header">
              <div><strong>{bug.title || "Issue"}</strong><span className={`bug-badge ${badgeClass(bug.severity)}`}>{bug.severity || "info"}</span></div>
              <button className="copy-btn" onClick={() => handleCopy(bug.description)}>📋</button>
            </div>
            {bug.line && <p className="muted">Line: {bug.line}</p>}
            <p>{bug.description}</p>
          </article>
        ))}
        {Boolean(result?.fixes?.length) && <h3>Corrected Code</h3>}
        {result?.fixes?.map((fix, i) => (
          <article className="fix-item" key={i}>
            <div className="fix-header">
              <strong>{fix.title}</strong>
              <button className="copy-btn" onClick={() => handleCopy(fix.code || fix.description)}>📋</button>
            </div>
            <div className="fix-compare">
              <div className="fix-pane before"><span>Before</span><p>{fix.description}</p></div>
              <div className="fix-pane after"><span>After (Corrected)</span>
                {fix.code ? (
                  <pre><code className="language-javascript" dangerouslySetInnerHTML={{ __html: hljs.highlight(fix.code, { language: "javascript" }).value }} /></pre>
                ) : <p>{fix.description}</p>}
              </div>
            </div>
          </article>
        ))}
        {Boolean(result?.explanations?.length) && <h3>Learning Explanations</h3>}
        {result?.explanations?.map((item, i) => (
          <div key={i} className="explanation-item">
            <p>{item}</p>
            <button className="copy-btn" onClick={() => handleCopy(item)}>📋</button>
          </div>
        ))}
      </section>
    </section>
  );
}

function AnalyseCircuit({ responseLang, provider, apiKey }) {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);
  const resultsRef = useRef(null);

  async function submit(event) {
    event.preventDefault();
    if (provider === "groq") { setError("Groq does not support image analysis. Please switch to Gemini."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData();
      form.append("image", image);
      form.append("response_language", responseLang);
      form.append("provider", provider);
      if (apiKey) form.append("api_key", apiKey);
      const response = await fetch(`${CORE_BACKEND_URL}/upload/circuit`, { method: "POST", body: form });
      setResult(await readJson(response));
    } catch (err) { setError(formatErrorMessage(err)); }
    finally { setLoading(false); }
  }

  const handleCopy = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };
  const handleExport = async (format) => {
    if (!result) return;
    if (format === "text") { downloadFile(new Blob([generateCircuitTextReport(result)], { type: "text/plain" }), "circuit-analysis.txt"); }
    else { await exportToPDF(resultsRef, "circuit-analysis.pdf"); }
  };

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>Circuit image
          <span className="upload-zone"><input accept="image/*" type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} /></span>
        </label>
        {previewUrl && <img className="preview" src={previewUrl} alt="Circuit preview" />}
        <button disabled={loading || !image} type="submit">{loading ? "Analysing..." : "Analyse Circuit"}</button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>Circuit Components</h2>
          {result && <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport("text")}>📄 Text</button>
            <button className="export-btn" onClick={() => handleExport("pdf")}>📕 PDF</button>
          </div>}
        </div>
        {!result && <p className="empty">Detected components appear here.</p>}
        {Boolean(result?.components?.length) && (
          <table>
            <thead><tr><th>Component Name</th><th>Description</th><th>Action</th></tr></thead>
            <tbody>
              {result.components.map((c, i) => (
                <tr className="component-row" key={i}>
                  <td>{c.name}</td><td>{c.description}</td>
                  <td><button className="copy-btn" onClick={() => handleCopy(`${c.name}: ${c.description}`)}>📋</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}

function LabReport({ responseLang, provider, apiKey }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef(null);

  async function submit(event) {
    event.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("response_language", responseLang);
      form.append("provider", provider);
      if (apiKey) form.append("api_key", apiKey);
      const response = await fetch(`${REPORT_PROCESSOR_URL}/process/report`, { method: "POST", body: form });
      setResult(await readJson(response));
    } catch (err) { setError(formatErrorMessage(err)); }
    finally { setLoading(false); }
  }

  const templateEntries = Object.entries(result?.template || {});
  const handleCopy = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };
  const handleExport = async (format) => {
    if (!result) return;
    if (format === "text") { downloadFile(new Blob([generateReportTextFile(result)], { type: "text/plain" }), "lab-report.txt"); }
    else { await exportToPDF(resultsRef, "lab-report.pdf"); }
  };

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>Lab report PDF or image
          <span className="upload-zone"><input accept="application/pdf,image/*" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></span>
        </label>
        <button disabled={loading || !file} type="submit">{loading ? "Processing..." : "Process Report"}</button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>Report Template</h2>
          {result && <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport("text")}>📄 Text</button>
            <button className="export-btn" onClick={() => handleExport("pdf")}>📕 PDF</button>
          </div>}
        </div>
        {!result && <p className="empty">Template sections and viva questions appear here.</p>}
        {templateEntries.map(([key, value]) => (
          <article className={`template-section section-${key}`} key={key}>
            <div className="section-header">
              <h3>{titleCase(key)}</h3>
              <button className="copy-btn" onClick={() => handleCopy(value)}>📋</button>
            </div>
            <p>{value}</p>
          </article>
        ))}
        {Boolean(result?.viva_questions?.length) && <h2>Viva Q&A</h2>}
        {result?.viva_questions?.map((item, i) => (
          <details className="viva-item" key={i}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
            <button className="copy-btn" onClick={() => handleCopy(item.a)}>📋</button>
          </details>
        ))}
      </section>
    </section>
  );
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.detail || "Request failed");
  return data;
}

function formatErrorMessage(error) {
  const msg = error.message || String(error);
  if (msg.includes("quota")) return "Quota exceeded. Please try again later.";
  if (msg.includes("401") || msg.includes("unauthorized")) return "Invalid API key. Please check your key.";
  if (msg.includes("429")) return "Rate limited. Please wait a moment and try again.";
  if (msg.includes("502")) return "AI service temporarily unavailable. Try again soon.";
  return msg;
}

function titleCase(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function badgeClass(value = "") {
  const n = value.toLowerCase();
  if (n.includes("error") || n.includes("critical") || n.includes("high")) return "badge-error";
  if (n.includes("warn") || n.includes("medium")) return "badge-warning";
  return "badge-info";
}

function generateTextReport(result) {
  let text = "=== DEBUG CODE ANALYSIS REPORT ===\n\n";
  result.bugs?.forEach((bug) => { text += `- ${bug.title} [${bug.severity || "info"}]\n  ${bug.description}\n\n`; });
  result.fixes?.forEach((fix) => { text += `- ${fix.title}\n  ${fix.description}\n${fix.code ? `  Code:\n${fix.code}\n` : ""}\n`; });
  result.explanations?.forEach((exp) => { text += `- ${exp}\n`; });
  return text;
}

function generateCircuitTextReport(result) {
  let text = "=== CIRCUIT ANALYSIS REPORT ===\n\n";
  result.components?.forEach((c) => { text += `- ${c.name}\n  ${c.description}\n\n`; });
  return text;
}

function generateReportTextFile(result) {
  let text = "=== LAB REPORT ===\n\n";
  Object.entries(result.template || {}).forEach(([key, value]) => { text += `${titleCase(key).toUpperCase()}\n${value}\n\n`; });
  result.viva_questions?.forEach((item, i) => { text += `${i + 1}. Q: ${item.q}\n   A: ${item.a}\n\n`; });
  return text;
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

async function exportToPDF(elementRef, filename) {
  if (!elementRef.current) return;
  try {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(elementRef.current, { backgroundColor: "#1a1a1a", scale: 2 });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const imgWidth = 210;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, (canvas.height * imgWidth) / canvas.width);
    pdf.save(filename);
  } catch (err) { alert("Failed to export PDF. Please try again."); }
}

createRoot(document.getElementById("root")).render(<App />);
