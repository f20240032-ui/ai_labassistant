import React, { useMemo, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import "./styles.css";

const CORE_BACKEND_URL = import.meta.env.VITE_CORE_BACKEND_URL || "http://localhost:3000";
const REPORT_PROCESSOR_URL = import.meta.env.VITE_REPORT_PROCESSOR_URL || "http://localhost:3002";

const tabs = ["Debug Code", "Analyse Circuit", "Lab Report", "Viva Prep"];
const SUPPORTED_LANGUAGES = ["Python", "MATLAB", "Arduino", "C", "C++", "JavaScript", "Java"];

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
      {activeTab === "Viva Prep" && <VivaPrepTool />}
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
  const resultsRef = useRef(null);

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
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleExport = async (format) => {
    if (!result) return;

    if (format === "text") {
      const text = generateTextReport(result);
      const blob = new Blob([text], { type: "text/plain" });
      downloadFile(blob, "debug-report.txt");
    } else if (format === "pdf") {
      await exportToPDF(resultsRef, "debug-report.pdf");
    }
  };

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>
          Language
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang}>{lang}</option>
            ))}
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

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>Annotated Bugs & Fixes</h2>
          {result && (
            <div className="export-buttons">
              <button className="export-btn" onClick={() => handleExport("text")}>
                📄 Text
              </button>
              <button className="export-btn" onClick={() => handleExport("pdf")}>
                📕 PDF
              </button>
            </div>
          )}
        </div>
        {!result && <p className="empty">Results appear here after analysis.</p>}
        
        {result?.bugs?.map((bug, index) => (
          <article className="bug-item" key={`${bug.title}-${index}`}>
            <div className="bug-header">
              <div>
                <strong>{bug.title || "Issue"}</strong>
                <span className={`bug-badge ${badgeClass(bug.severity)}`}>
                  {bug.severity || "info"}
                </span>
              </div>
              <button className="copy-btn" onClick={() => handleCopy(bug.description)} title="Copy">
                📋
              </button>
            </div>
            {bug.line && <p className="muted">Line: {bug.line}</p>}
            <p>{bug.description}</p>
          </article>
        ))}
        
        {Boolean(result?.fixes?.length) && <h3>Corrected Code</h3>}
        {result?.fixes?.map((fix, index) => (
          <article className="fix-item" key={`${fix.title}-${index}`}>
            <div className="fix-header">
              <strong>{fix.title}</strong>
              <button className="copy-btn" onClick={() => handleCopy(fix.code || fix.description)} title="Copy">
                📋
              </button>
            </div>
            <div className="fix-compare">
              <div className="fix-pane before">
                <span>Before</span>
                <p>{fix.description}</p>
              </div>
              <div className="fix-pane after">
                <span>After (Corrected)</span>
                {fix.code ? (
                  <pre>
                    <code 
                      className="language-javascript"
                      dangerouslySetInnerHTML={{ 
                        __html: hljs.highlight(fix.code, { language: 'javascript' }).value 
                      }}
                    />
                  </pre>
                ) : (
                  <p>{fix.description}</p>
                )}
              </div>
            </div>
          </article>
        ))}
        
        {Boolean(result?.explanations?.length) && <h3>Learning Explanations</h3>}
        {result?.explanations?.map((item, index) => (
          <div key={index} className="explanation-item">
            <p>{item}</p>
            <button className="copy-btn" onClick={() => handleCopy(item)} title="Copy">
              📋
            </button>
          </div>
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
  const resultsRef = useRef(null);

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
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleExport = async (format) => {
    if (!result) return;

    if (format === "text") {
      const text = generateCircuitTextReport(result);
      const blob = new Blob([text], { type: "text/plain" });
      downloadFile(blob, "circuit-analysis.txt");
    } else if (format === "pdf") {
      await exportToPDF(resultsRef, "circuit-analysis.pdf");
    }
  };

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

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>Circuit Components</h2>
          {result && (
            <div className="export-buttons">
              <button className="export-btn" onClick={() => handleExport("text")}>
                📄 Text
              </button>
              <button className="export-btn" onClick={() => handleExport("pdf")}>
                📕 PDF
              </button>
            </div>
          )}
        </div>
        {!result && <p className="empty">Detected components appear here.</p>}
        {Boolean(result?.components?.length) && (
          <table>
            <thead>
              <tr>
                <th>Component Name</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {result.components.map((component, index) => (
                <tr className="component-row" key={`${component.name}-${index}`}>
                  <td>{component.name}</td>
                  <td>{component.description}</td>
                  <td>
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(`${component.name}: ${component.description}`)}
                      title="Copy"
                    >
                      📋
                    </button>
                  </td>
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
  const resultsRef = useRef(null);

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
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const templateEntries = Object.entries(result?.template || {});

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleExport = async (format) => {
    if (!result) return;

    if (format === "text") {
      const text = generateReportTextFile(result);
      const blob = new Blob([text], { type: "text/plain" });
      downloadFile(blob, "lab-report.txt");
    } else if (format === "pdf") {
      await exportToPDF(resultsRef, "lab-report.pdf");
    }
  };

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

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>Report Template</h2>
          {result && (
            <div className="export-buttons">
              <button className="export-btn" onClick={() => handleExport("text")}>
                📄 Text
              </button>
              <button className="export-btn" onClick={() => handleExport("pdf")}>
                📕 PDF
              </button>
            </div>
          )}
        </div>
        {!result && <p className="empty">Template sections and viva questions appear here.</p>}
        {templateEntries.map(([key, value]) => (
          <article className={`template-section section-${key}`} key={key}>
            <div className="section-header">
              <h3>{titleCase(key)}</h3>
              <button className="copy-btn" onClick={() => handleCopy(value)} title="Copy">
                📋
              </button>
            </div>
            <p>{value}</p>
          </article>
        ))}
        {Boolean(result?.viva_questions?.length) && <h2>Viva Q&A</h2>}
        {result?.viva_questions?.map((item, index) => (
          <details className="viva-item" key={`${item.q}-${index}`}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
            <button className="copy-btn" onClick={() => handleCopy(item.a)} title="Copy Answer">
              📋
            </button>
          </details>
        ))}
      </section>
    </section>
  );
}

function VivaPrepTool() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef(null);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${CORE_BACKEND_URL}/analyze/viva`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      const data = await readJson(response);
      setResult(data);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleExport = async (format) => {
    if (!result) return;

    if (format === "text") {
      const text = generateVivaTextReport(result);
      const blob = new Blob([text], { type: "text/plain" });
      downloadFile(blob, "viva-prep.txt");
    } else if (format === "pdf") {
      await exportToPDF(resultsRef, "viva-prep.pdf");
    }
  };

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>
          Topic / Experiment Name
          <input
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g., Diode Characteristics"
          />
        </label>
        <label>
          Question Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <button disabled={loading || !topic.trim()} type="submit">
          {loading ? "Generating..." : "Generate Questions"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>Viva Questions</h2>
          {result && (
            <div className="export-buttons">
              <button className="export-btn" onClick={() => handleExport("text")}>
                📄 Text
              </button>
              <button className="export-btn" onClick={() => handleExport("pdf")}>
                📕 PDF
              </button>
            </div>
          )}
        </div>
        {!result && <p className="empty">Generated viva questions appear here.</p>}
        {result?.questions?.map((item, index) => (
          <details className="viva-item" key={`${item.q}-${index}`}>
            <summary>
              <span className={`difficulty-badge ${item.difficulty?.toLowerCase() || 'medium'}`}>
                {item.difficulty || difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
              {item.q}
            </summary>
            <p>{item.a}</p>
            <button className="copy-btn" onClick={() => handleCopy(item.a)} title="Copy Answer">
              📋
            </button>
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

function formatErrorMessage(error) {
  const msg = error.message || String(error);
  
  if (msg.includes("quota")) return "Quota exceeded. Please try again later.";
  if (msg.includes("401") || msg.includes("unauthorized")) return "Authentication failed. Check your API key.";
  if (msg.includes("429")) return "Rate limited. Please wait a moment and try again.";
  if (msg.includes("502")) return "AI service temporarily unavailable. Try again soon.";
  
  return msg;
}

function titleCase(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function badgeClass(value = "") {
  const normalized = value.toLowerCase();
  if (normalized.includes("error") || normalized.includes("critical") || normalized.includes("high"))
    return "badge-error";
  if (normalized.includes("warn") || normalized.includes("medium")) return "badge-warning";
  return "badge-info";
}

function generateTextReport(result) {
  let text = "=== DEBUG CODE ANALYSIS REPORT ===\n\n";

  if (result.bugs?.length) {
    text += "BUGS FOUND:\n";
    result.bugs.forEach((bug) => {
      text += `- ${bug.title} [${bug.severity || "info"}]\n`;
      if (bug.line) text += `  Line: ${bug.line}\n`;
      text += `  ${bug.description}\n\n`;
    });
  }

  if (result.fixes?.length) {
    text += "\nCORRECTED CODE:\n";
    result.fixes.forEach((fix) => {
      text += `- ${fix.title}\n`;
      text += `  ${fix.description}\n`;
      if (fix.code) text += `  Code:\n${fix.code}\n\n`;
    });
  }

  if (result.explanations?.length) {
    text += "\nEXPLANATIONS:\n";
    result.explanations.forEach((exp) => {
      text += `- ${exp}\n`;
    });
  }

  return text;
}

function generateCircuitTextReport(result) {
  let text = "=== CIRCUIT ANALYSIS REPORT ===\n\n";
  
  if (result.components?.length) {
    text += "DETECTED COMPONENTS:\n";
    result.components.forEach((comp) => {
      text += `- ${comp.name}\n  ${comp.description}\n\n`;
    });
  }

  return text;
}

function generateReportTextFile(result) {
  let text = "=== LAB REPORT ===\n\n";

  Object.entries(result.template || {}).forEach(([key, value]) => {
    text += `${titleCase(key).toUpperCase()}\n${value}\n\n`;
  });

  if (result.viva_questions?.length) {
    text += "\n=== VIVA QUESTIONS ===\n";
    result.viva_questions.forEach((item, idx) => {
      text += `${idx + 1}. Q: ${item.q}\n   A: ${item.a}\n\n`;
    });
  }

  return text;
}

function generateVivaTextReport(result) {
  let text = "=== VIVA PREPARATION GUIDE ===\n\n";

  if (result.questions?.length) {
    result.questions.forEach((item, idx) => {
      text += `${idx + 1}. [${item.difficulty || "Medium"}] ${item.q}\n`;
      text += `   Answer: ${item.a}\n\n`;
    });
  }

  return text;
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportToPDF(elementRef, filename) {
  if (!elementRef.current) return;

  try {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(elementRef.current, {
      backgroundColor: "#1a1a1a",
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    pdf.save(filename);
  } catch (err) {
    console.error("PDF export failed:", err);
    alert("Failed to export PDF. Please try again.");
  }
}

createRoot(document.getElementById("root")).render(<App />);
