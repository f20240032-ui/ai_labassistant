# 🧪 AI Lab Assistant
### An AI-powered academic platform designed to help engineering students understand experiments, debug code, analyze circuits, prepare for vivas, and generate comprehensive lab reports.

---

## 📖 Overview & Problem Statement
Engineering students frequently face friction when executing and documenting their laboratory coursework. Common hurdles include:
* **Conceptual Gaps:** Difficulty understanding complex laboratory manuals and experiment objectives.
* **Debugging Roadblocks:** Spending hours tracking down logical errors in **MATLAB, Python, C, and Arduino** code.
* **Viva Vulnerability:** Lack of targeted preparation resources for spontaneous oral examinations.
* **Documentation Fatigue:** Structuring, compiling, and finalizing repetitive, detailed lab reports.
* **Resource Fragmentation:** Constantly switching between textbooks, hardware data sheets, stack exchange forums, and standard chatbots.

**AI Lab Assistant** solves this by unifying code debugging, circuit schematic analysis, report compilation, and exam preparation into a single intelligent portal.

---

## 🎯 The Solution
Students can directly upload raw source files, reference documentation, or structural imagery, including:
* [x] Lab Manuals & Experiment PDFs
* [x] MATLAB Code & Data Scripts
* [x] Python Programs & Notebooks
* [x] Arduino Sketches & C/C++ Source Files
* [x] Circuit Diagrams, Schematics & Hardware Screenshots

The application leverages advanced multimodal AI to parse inputs, locate syntax or component faults, suggest optimizations, generate tailored viva questions, and output clean report structures.

---

## ✨ Core Features

### 🔍 Code Analysis & Optimization
Upload source files written in **MATLAB, Python, C, C++, or Arduino**. The engine instantly provides:
* Automated compile-time and logical error detection.
* Line-by-line runtime logic explanations.
* Drop-in script bug fixes.
* Readability refactoring and execution performance tips.

### ⚡ Multimodal Circuit Analysis
Upload schematic images or circuit wireframes to get:
* Automated circuit/topology identification (e.g., Op-Amps, Combinational Logic Gates).
* Discrete component explanations and pins configuration mapping.
* Core working principles and mathematical formula references.
* System applications and embedded hardware interface steps.

### 🎤 Target Viva Preparation
Prepares students for laboratory vivas by creating customized mock question sets categorized by:
* **Theory Questions:** Evaluating fundamental underlying laws.
* **Application-Based Questions:** Real-world usage scenarios.
* **Numerical Layouts:** Quick variable calculation challenges.
* **Troubleshooting:** Identifying simulated system failure states.

### 📝 Automated Lab Report Generation
Compiles structured, academic-ready laboratory reports instantly containing:
1. **Aim & Objectives**
2. **Underlying Scientific Theory**
3. **Step-by-Step Procedure**
4. **Data Observations Tables**
5. **Calculated Results & Plotted Curves**
6. **Final Conclusion**

### 📚 Interactive Formula Breakdown
Input any engineering formula to instantly receive comprehensive variable definitions, SI unit dimensional analysis, step-by-step example problem matrices, and practical real-world engineering use cases.

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