# 🧪 AI Lab Assistant
### An AI-powered academic platform designed to help engineering students understand experiments, debug code, analyze circuits, and generate comprehensive lab reports.

---

## 📖 Overview & Problem Statement
Engineering students frequently face friction when executing and documenting their laboratory coursework. Common hurdles include:
* **Conceptual Gaps:** Difficulty understanding complex laboratory manuals and experiment objectives.
* **Debugging Roadblocks:** Spending hours tracking down logical errors in **MATLAB, Python, C, C++, Arduino, JavaScript, and Java** code.
* **Documentation Fatigue:** Structuring, compiling, and finalizing repetitive, detailed lab reports.
* **Resource Fragmentation:** Constantly switching between textbooks, hardware data sheets, stack exchange forums, and standard chatbots.

**AI Lab Assistant** solves this by unifying code debugging, circuit schematic analysis, and report compilation into a single intelligent portal.

---

## 🎯 The Solution
Students can directly upload raw source files, reference documentation, or structural imagery, including:
* [x] Lab Manuals & Experiment PDFs
* [x] MATLAB Code & Data Scripts
* [x] Python Programs & Notebooks
* [x] Arduino Sketches & C/C++/Java Source Files
* [x] Circuit Diagrams, Schematics & Hardware Screenshots

The application leverages advanced multimodal AI to parse inputs, locate syntax or component faults, suggest optimizations, and output clean report structures.

---

## ✨ Core Features

### 🔍 Code Analysis & Optimization
Upload source files written in **MATLAB, Python, C, C++, Java, Arduino, or JavaScript**. The engine instantly provides:
* Automated compile-time and logical error detection
* Line-by-line runtime logic explanations
* **Drop-in script bug fixes** with before/after comparison
* **Syntax-highlighted code display**
* **Copy-to-clipboard** buttons on all outputs
* **Export results as PDF or TXT** files
* Readability refactoring and execution performance tips

### ⚡ Multimodal Circuit Analysis
Upload schematic images or circuit wireframes to get:
* Automated circuit/topology identification (e.g., Op-Amps, Combinational Logic Gates)
* Discrete component explanations and pins configuration mapping
* Core working principles and mathematical formula references
* System applications and embedded hardware interface steps
* **Copy components** and export analysis as PDF/Text

### 📝 Automated Lab Report Generation
Compiles structured, academic-ready laboratory reports instantly containing:
1. **Aim & Objectives**
2. **Underlying Scientific Theory**
3. **Step-by-Step Procedure**
4. **Data Observations Tables**
5. **Calculated Results & Plotted Curves**
6. **Final Conclusion**

### 📚 Premium Features
✅ **Copy to clipboard button** on all outputs  
✅ **Syntax-highlighted code display** using highlight.js  
✅ **Export results as PDF/text** download option  
✅ **7+ programming languages** supported (Python, MATLAB, C, C++, Java, Arduino, JavaScript)  
✅ **Better error messages** ("Quota exceeded, try again later" instead of raw errors)  
✅ **Auto-corrected code** — corrected code provided in same analysis  
✅ **Sliding dark/light mode button** for smooth theme switching  
✅ **Responsive design** for desktop, tablet, and mobile

---

## 🏗️ System Architecture

```text
                     +---------------------------------------+
                     |           [3] Student UI              |
                     |           (Port :3001)                |
                     +---+-------------------------------+---+
                         |                               |
                         | Multipart Form Data           | REST / JSON
                         | (PDFs, Images, Code)          |
                         ▼                               ▼
     +-------------------+-------------------+       +---+-------------------+
     |       [4] Lab Report Processor        |       |   [2] Core Backend    |
     |         (Port :3002)                  |       |     (Port :3000)      |
     +---------------------------------------+       +---+-----------+-------+
                                                         |           |
                                         Trigger Context |           | Token Payload
                                                         ▼           |
                                     +-------------------+---+       |
                                     | [1] AI Layer Core     |       ▼
                                     |   (Port :5001)        |   +---+---------------+
                                     +-----------------------+   | [5] Gemini Engine |
                                                                 |   (External API)  |
                                                                 +-------------------+
```

---

## 🚀 Quick Start

### Installation
```bash
npm install:all
```

### Development
```bash
npm run dev
```

This starts all services concurrently:
- AI Core (FastAPI) on `:5001`
- Core Backend (Express) on `:3000`
- Student UI (Vite React) on `:3001`
- Report Processor on `:3002`

---

## 📁 Project Structure

```
ai_labassistant/
├── services/
│   ├── ai-core/              # FastAPI AI engine
│   ├── core-backend/         # Express.js API gateway
│   ├── student-ui/           # React + Vite frontend
│   └── report-processor/     # Report compilation service
├── package.json              # Monorepo configuration
└── README.md                 # This file
```

---

## 🔧 Environment Configuration

### `.env` (AI Core - services/ai-core/)
```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
PORT=5001
LOG_LEVEL=info
```

### `.env` (Core Backend - services/core-backend/)
```
PORT=3000
AI_CORE_URL=http://localhost:5001
REPORT_PROCESSOR_URL=http://localhost:3002
```

### `.env` (Student UI - services/student-ui/)
```
VITE_CORE_BACKEND_URL=http://localhost:3000
VITE_REPORT_PROCESSOR_URL=http://localhost:3002
```

---

## 🛠️ Technologies Used

### Frontend
- **React 18.3** - UI library
- **Vite 6.0** - Build tool
- **Highlight.js 11.9** - Syntax highlighting
- **jsPDF 2.5** - PDF export
- **html2canvas 1.4** - HTML to canvas conversion

### Backend
- **Express 4.21** - Web framework
- **FastAPI** - Python API framework
- **Multer** - File upload handling

### AI & ML
- **Google Gemini 1.5** - Multimodal AI engine
- **Google Generative AI SDK**

---

## 📝 API Endpoints

### Code Analysis
```
POST /upload/code
Content-Type: multipart/form-data
{
  "language": "Python|MATLAB|Arduino|C|C++|JavaScript|Java",
  "code": "source code string or file"
}
```

### Circuit Analysis
```
POST /upload/circuit
Content-Type: multipart/form-data
{
  "image": "circuit diagram image file"
}
```

### Report Processing
```
POST /process/report
Content-Type: multipart/form-data
{
  "file": "lab report PDF or image"
}
```

---

## 🎨 UI Features

### Theme Toggle
- 🌙 Dark mode - Easy on eyes, better for coding
- ☀️ Light mode - Better print quality, easier reading
- Smooth transition animation
- Persistent preference (localStorage)

### Export Options
- **📄 Text Export** - Download results as `.txt` file
- **📕 PDF Export** - Download results as styled PDF
- **📋 Copy to Clipboard** - One-click copy for any content block

### Code Display
- **Syntax highlighting** for 50+ programming languages
- **Scrollable code blocks** with proper formatting
- **Line numbers** in pre-formatted code

---

## 🐛 Error Handling

The application provides user-friendly error messages:
- **Quota exceeded**: "Quota exceeded. Please try again later."
- **Authentication error**: "Authentication failed. Check your API key."
- **Rate limited**: "Rate limited. Please wait a moment and try again."
- **Service unavailable**: "AI service temporarily unavailable. Try again soon."

---

## 📊 Supported Languages

| Language | Support |
|----------|---------|
| Python | ✅ Full |
| MATLAB | ✅ Full |
| C | ✅ Full |
| C++ | ✅ Full |
| Arduino | ✅ Full |
| JavaScript | ✅ Full |
| Java | ✅ Full |

---

## 🔐 Security Considerations

- API keys stored in `.env` files (never committed)
- CORS configured for local development
- Multer limits file upload sizes
- Input validation on all endpoints

---

## 📦 Deployment

### Build for Production
```bash
npm run build --prefix services/student-ui
```

### Docker Support (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install:all
RUN npm run build --prefix services/student-ui
EXPOSE 3000 3001 3002 5001
CMD npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📄 License

This project is proprietary and for educational use only.

---

## 📞 Support & Contact

For issues, feature requests, or questions:
- 📧 Email: support@ai-labassistant.local
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 🙏 Acknowledgments

- **Google Gemini** for powering the AI analysis
- **React & Vite** communities for excellent tools
- **Engineering students** who inspired this platform

---

**Last Updated**: June 11, 2026  
**Version**: 1.0.0  
**Status**: Active Development
