import React, { useMemo, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import "./styles.css";

const CORE_BACKEND_URL = import.meta.env.VITE_CORE_BACKEND_URL || "http://localhost:3000";
const REPORT_PROCESSOR_URL = import.meta.env.VITE_REPORT_PROCESSOR_URL || "http://localhost:3002";

const SUPPORTED_LANGUAGES = ["Python", "MATLAB", "Arduino", "C", "C++", "JavaScript", "Java"];

const TRANSLATIONS = {
  English: {
    eyebrow: "Localhost AI Lab Assistant",
    title: "Student Lab Workbench",
    light: "Light", dark: "Dark",
    tabs: ["Debug Code", "Analyse Circuit", "Lab Report"],
    language: "Language", code: "Code", codePlaceholder: "Paste lab code for static analysis",
    uploadFile: "Or upload source file", debugBtn: "Debug Code", analysing: "Analysing...",
    bugsTitle: "Annotated Bugs & Fixes", noResults: "Results appear here after analysis.",
    correctedCode: "Corrected Code", explanations: "Learning Explanations",
    circuitImage: "Circuit image", analyseBtn: "Analyse Circuit",
    componentsTitle: "Circuit Components", noComponents: "Detected components appear here.",
    compName: "Component Name", description: "Description", action: "Action",
    reportFile: "Lab report PDF or image", processBtn: "Process Report", processing: "Processing...",
    reportTitle: "Report Template", noReport: "Template sections and viva questions appear here.",
    vivaTitle: "Viva Q&A", before: "Before", after: "After (Corrected)",
    providerLabel: "AI Provider", apiKeyPlaceholder: "Gemini API key (optional)",
    groqKeyPlaceholder: "Groq API key (required)",
    groqWarning: "⚠️ Groq requires an API key. Get one free at",
    groqError: "Groq does not support image analysis. Please switch to Gemini.",
    copied: "Copied!",
  },
  Hindi: {
    eyebrow: "लोकलहोस्ट AI लैब असिस्टेंट",
    title: "छात्र लैब वर्कबेंच",
    light: "लाइट", dark: "डार्क",
    tabs: ["कोड डीबग करें", "सर्किट विश्लेषण", "लैब रिपोर्ट"],
    language: "भाषा", code: "कोड", codePlaceholder: "स्थैतिक विश्लेषण के लिए लैब कोड पेस्ट करें",
    uploadFile: "या सोर्स फ़ाइल अपलोड करें", debugBtn: "कोड डीबग करें", analysing: "विश्लेषण हो रहा है...",
    bugsTitle: "बग्स और सुधार", noResults: "विश्लेषण के बाद परिणाम यहाँ दिखेंगे।",
    correctedCode: "सुधारित कोड", explanations: "सीखने की व्याख्या",
    circuitImage: "सर्किट छवि", analyseBtn: "सर्किट विश्लेषण करें",
    componentsTitle: "सर्किट घटक", noComponents: "पहचाने गए घटक यहाँ दिखेंगे।",
    compName: "घटक का नाम", description: "विवरण", action: "क्रिया",
    reportFile: "लैब रिपोर्ट PDF या छवि", processBtn: "रिपोर्ट प्रोसेस करें", processing: "प्रोसेस हो रहा है...",
    reportTitle: "रिपोर्ट टेम्पलेट", noReport: "टेम्पलेट सेक्शन और वाइवा प्रश्न यहाँ दिखेंगे।",
    vivaTitle: "वाइवा प्रश्नोत्तर", before: "पहले", after: "बाद (सुधारित)",
    providerLabel: "AI प्रदाता", apiKeyPlaceholder: "Gemini API कुंजी (वैकल्पिक)",
    groqKeyPlaceholder: "Groq API कुंजी (आवश्यक)",
    groqWarning: "⚠️ Groq के लिए API कुंजी आवश्यक है। मुफ्त में पाएं",
    groqError: "Groq छवि विश्लेषण का समर्थन नहीं करता। कृपया Gemini पर स्विच करें।",
    copied: "कॉपी हो गया!",
  },
  Telugu: {
    eyebrow: "లోకల్‌హోస్ట్ AI లాబ్ అసిస్టెంట్",
    title: "విద్యార్థి లాబ్ వర్క్‌బెంచ్",
    light: "లైట్", dark: "డార్క్",
    tabs: ["కోడ్ డీబగ్", "సర్క్యూట్ విశ్లేషణ", "లాబ్ రిపోర్ట్"],
    language: "భాష", code: "కోడ్", codePlaceholder: "స్టాటిక్ విశ్లేషణ కోసం లాబ్ కోడ్ పేస్ట్ చేయండి",
    uploadFile: "లేదా సోర్స్ ఫైల్ అప్‌లోడ్ చేయండి", debugBtn: "కోడ్ డీబగ్ చేయండి", analysing: "విశ్లేషిస్తోంది...",
    bugsTitle: "బగ్‌లు మరియు సరిదిద్దులు", noResults: "విశ్లేషణ తర్వాత ఫలితాలు ఇక్కడ కనిపిస్తాయి.",
    correctedCode: "సరిదిద్దిన కోడ్", explanations: "నేర్చుకోవడానికి వివరణలు",
    circuitImage: "సర్క్యూట్ చిత్రం", analyseBtn: "సర్క్యూట్ విశ్లేషించండి",
    componentsTitle: "సర్క్యూట్ భాగాలు", noComponents: "గుర్తించిన భాగాలు ఇక్కడ కనిపిస్తాయి.",
    compName: "భాగం పేరు", description: "వివరణ", action: "చర్య",
    reportFile: "లాబ్ రిపోర్ట్ PDF లేదా చిత్రం", processBtn: "రిపోర్ట్ ప్రాసెస్ చేయండి", processing: "ప్రాసెస్ అవుతోంది...",
    reportTitle: "రిపోర్ట్ టెంప్లేట్", noReport: "టెంప్లేట్ విభాగాలు మరియు వైవా ప్రశ్నలు ఇక్కడ కనిపిస్తాయి.",
    vivaTitle: "వైవా ప్రశ్నోత్తరాలు", before: "ముందు", after: "తర్వాత (సరిదిద్దిన)",
    providerLabel: "AI ప్రొవైడర్", apiKeyPlaceholder: "Gemini API కీ (ఐచ్ఛికం)",
    groqKeyPlaceholder: "Groq API కీ (అవసరం)",
    groqWarning: "⚠️ Groq కి API కీ అవసరం. ఉచితంగా పొందండి",
    groqError: "Groq చిత్ర విశ్లేషణకు మద్దతు ఇవ్వదు. దయచేసి Gemini కి మారండి.",
    copied: "కాపీ అయింది!",
  },
};

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("English");
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const isLight = theme === "light";
  const t = TRANSLATIONS[lang];

  return (
    <main className="app-shell" data-theme={theme}>
      <header className="app-header">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <select value={lang} onChange={(e) => setLang(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "8px", fontWeight: 600 }} aria-label="UI language">
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
          </select>
          <select value={provider} onChange={(e) => { setProvider(e.target.value); setApiKey(""); }}
            style={{ padding: "6px 10px", borderRadius: "8px", fontWeight: 600 }} aria-label="AI provider">
            <option value="gemini">Gemini (Google)</option>
            <option value="groq">Groq (Free/Fast)</option>
          </select>
          <input type="password"
            placeholder={provider === "groq" ? t.groqKeyPlaceholder : t.apiKeyPlaceholder}
            value={apiKey} onChange={(e) => setApiKey(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "8px", width: "190px" }} aria-label="API key" />
          <button aria-label={`Switch to ${isLight ? t.dark : t.light} mode`} aria-pressed={isLight}
            className="theme-toggle" onClick={() => setTheme(isLight ? "dark" : "light")} type="button">
            <span className="theme-toggle-track"><span className="theme-toggle-thumb" /></span>
            <span className="theme-toggle-text">{isLight ? t.light : t.dark}</span>
          </button>
        </div>
      </header>

      {provider === "groq" && !apiKey && (
        <p style={{ textAlign: "center", color: "#ffc107", marginBottom: "8px", fontSize: "0.85rem" }}>
          {t.groqWarning}{" "}
          <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: "#0de2c4" }}>console.groq.com</a>
        </p>
      )}

      <nav className="tabs" aria-label="Lab assistant tools">
        {t.tabs.map((tab, i) => (
          <button key={i} className={activeTab === i ? "tab active" : "tab"}
            onClick={() => setActiveTab(i)} type="button">{tab}</button>
        ))}
      </nav>

      {activeTab === 0 && <DebugCode t={t} lang={lang} provider={provider} apiKey={apiKey} />}
      {activeTab === 1 && <AnalyseCircuit t={t} lang={lang} provider={provider} apiKey={apiKey} />}
      {activeTab === 2 && <LabReport t={t} lang={lang} provider={provider} apiKey={apiKey} />}
    </main>
  );
}

function DebugCode({ t, lang, provider, apiKey }) {
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
      form.append("response_language", lang);
      form.append("provider", provider);
      if (apiKey) form.append("api_key", apiKey);
      if (file) { form.append("file", file); } else { form.append("code", code); }
      const response = await fetch(`${CORE_BACKEND_URL}/upload/code`, { method: "POST", body: form });
      setResult(await readJson(response));
    } catch (err) { setError(formatErrorMessage(err)); }
    finally { setLoading(false); }
  }

  const handleCopy = (text) => { navigator.clipboard.writeText(text); alert(t.copied); };
  const handleExport = async (format) => {
    if (!result) return;
    if (format === "text") { downloadFile(new Blob([generateTextReport(result)], { type: "text/plain" }), "debug-report.txt"); }
    else { await exportToPDF(resultsRef, "debug-report.pdf"); }
  };

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>{t.language}
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {SUPPORTED_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
        <label>{t.code}
          <textarea value={code} disabled={Boolean(file)} onChange={(e) => setCode(e.target.value)} placeholder={t.codePlaceholder} />
        </label>
        <label>{t.uploadFile}
          <span className="upload-zone"><input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></span>
        </label>
        <button disabled={loading || (!code.trim() && !file)} type="submit">{loading ? t.analysing : t.debugBtn}</button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>{t.bugsTitle}</h2>
          {result && <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport("text")}>📄 Text</button>
            <button className="export-btn" onClick={() => handleExport("pdf")}>📕 PDF</button>
          </div>}
        </div>
        {!result && <p className="empty">{t.noResults}</p>}
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
        {Boolean(result?.fixes?.length) && <h3>{t.correctedCode}</h3>}
        {result?.fixes?.map((fix, i) => (
          <article className="fix-item" key={i}>
            <div className="fix-header">
              <strong>{fix.title}</strong>
              <button className="copy-btn" onClick={() => handleCopy(fix.code || fix.description)}>📋</button>
            </div>
            <div className="fix-compare">
              <div className="fix-pane before"><span>{t.before}</span><p>{fix.description}</p></div>
              <div className="fix-pane after"><span>{t.after}</span>
                {fix.code ? (
                  <pre><code className="language-javascript" dangerouslySetInnerHTML={{ __html: hljs.highlight(fix.code, { language: "javascript" }).value }} /></pre>
                ) : <p>{fix.description}</p>}
              </div>
            </div>
          </article>
        ))}
        {Boolean(result?.explanations?.length) && <h3>{t.explanations}</h3>}
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

function AnalyseCircuit({ t, lang, provider, apiKey }) {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);
  const resultsRef = useRef(null);

  async function submit(event) {
    event.preventDefault();
    if (provider === "groq") { setError(t.groqError); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData();
      form.append("image", image);
      form.append("response_language", lang);
      form.append("provider", provider);
      if (apiKey) form.append("api_key", apiKey);
      const response = await fetch(`${CORE_BACKEND_URL}/upload/circuit`, { method: "POST", body: form });
      setResult(await readJson(response));
    } catch (err) { setError(formatErrorMessage(err)); }
    finally { setLoading(false); }
  }

  const handleCopy = (text) => { navigator.clipboard.writeText(text); alert(t.copied); };
  const handleExport = async (format) => {
    if (!result) return;
    if (format === "text") { downloadFile(new Blob([generateCircuitTextReport(result)], { type: "text/plain" }), "circuit-analysis.txt"); }
    else { await exportToPDF(resultsRef, "circuit-analysis.pdf"); }
  };

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>{t.circuitImage}
          <span className="upload-zone"><input accept="image/*" type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} /></span>
        </label>
        {previewUrl && <img className="preview" src={previewUrl} alt="Circuit preview" />}
        <button disabled={loading || !image} type="submit">{loading ? t.analysing : t.analyseBtn}</button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>{t.componentsTitle}</h2>
          {result && <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport("text")}>📄 Text</button>
            <button className="export-btn" onClick={() => handleExport("pdf")}>📕 PDF</button>
          </div>}
        </div>
        {!result && <p className="empty">{t.noComponents}</p>}
        {Boolean(result?.components?.length) && (
          <table>
            <thead><tr><th>{t.compName}</th><th>{t.description}</th><th>{t.action}</th></tr></thead>
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

function LabReport({ t, lang, provider, apiKey }) {
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
      form.append("response_language", lang);
      form.append("provider", provider);
      if (apiKey) form.append("api_key", apiKey);
      const response = await fetch(`${REPORT_PROCESSOR_URL}/process/report`, { method: "POST", body: form });
      setResult(await readJson(response));
    } catch (err) { setError(formatErrorMessage(err)); }
    finally { setLoading(false); }
  }

  const templateEntries = Object.entries(result?.template || {});
  const handleCopy = (text) => { navigator.clipboard.writeText(text); alert(t.copied); };
  const handleExport = async (format) => {
    if (!result) return;
    if (format === "text") { downloadFile(new Blob([generateReportTextFile(result)], { type: "text/plain" }), "lab-report.txt"); }
    else { await exportToPDF(resultsRef, "lab-report.pdf"); }
  };

  return (
    <section className="tool-grid">
      <form className="panel" onSubmit={submit}>
        <label>{t.reportFile}
          <span className="upload-zone"><input accept="application/pdf,image/*" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></span>
        </label>
        <button disabled={loading || !file} type="submit">{loading ? t.processing : t.processBtn}</button>
        {error && <p className="error">{error}</p>}
      </form>

      <section className="panel results" ref={resultsRef}>
        <div className="results-toolbar">
          <h2>{t.reportTitle}</h2>
          {result && <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport("text")}>📄 Text</button>
            <button className="export-btn" onClick={() => handleExport("pdf")}>📕 PDF</button>
          </div>}
        </div>
        {!result && <p className="empty">{t.noReport}</p>}
        {templateEntries.map(([key, value]) => (
          <article className={`template-section section-${key}`} key={key}>
            <div className="section-header">
              <h3>{titleCase(key)}</h3>
              <button className="copy-btn" onClick={() => handleCopy(value)}>📋</button>
            </div>
            <p>{value}</p>
          </article>
        ))}
        {Boolean(result?.viva_questions?.length) && <h2>{t.vivaTitle}</h2>}
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
  if (msg.includes("401") || msg.includes("unauthorized")) return "Invalid API key.";
  if (msg.includes("429")) return "Rate limited. Please wait and try again.";
  if (msg.includes("502")) return "AI service unavailable. Try again soon.";
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
