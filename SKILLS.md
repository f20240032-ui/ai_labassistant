# 🎯 SKILLS.md - Feature Skills & Usage Guide

This document describes all available features and how to use them effectively.

---

## 📑 Table of Contents
1. [Code Debug Skills](#code-debug-skills)
2. [Circuit Analysis Skills](#circuit-analysis-skills)
3. [Report Generation Skills](#report-generation-skills)
4. [Viva Preparation Skills](#viva-preparation-skills)
5. [Export & Sharing Skills](#export--sharing-skills)
6. [UI/UX Skills](#uiux-skills)

---

## 🐛 Code Debug Skills

### Skill 1: Syntax Error Detection
**What it does**: Identifies syntax errors that prevent code compilation.

**How to use**:
1. Go to "Debug Code" tab
2. Select your programming language
3. Paste code or upload file
4. Click "Debug Code"

**Output Includes**:
- Error location (line number)
- Error type
- Brief description
- Suggested fix

**Example**:
```python
# Before (with error)
for i in range(10)
    print(i)

# Error: Missing colon after for statement (Line 1) - CRITICAL
# Fix: Add ':' after the range statement
```

---

### Skill 2: Logical Error Identification
**What it does**: Finds logical errors that compile but produce incorrect results.

**Common Issues Detected**:
- Off-by-one errors
- Incorrect loop conditions
- Wrong variable assignments
- Logic flow issues
- Boundary condition errors

**Example**:
```python
# Bug: Array index out of bounds
arr = [1, 2, 3, 4, 5]
for i in range(len(arr) + 1):  # ERROR: Should be range(len(arr))
    print(arr[i])

# Severity: WARNING
# Description: Loop will iterate one extra time, causing IndexError
```

---

### Skill 3: Auto-Corrected Code
**What it does**: Provides corrected code snippets with explanations.

**Features**:
- ✅ Before/After comparison
- ✅ Syntax-highlighted code
- ✅ Copy-to-clipboard button
- ✅ Explanation of changes

**How it works**:
1. Analysis identifies issues
2. Generates corrected code
3. Shows side-by-side comparison
4. User can copy corrected code

---

### Skill 4: Severity Classification
**What it does**: Labels bugs by severity level for prioritization.

**Severity Levels**:

| Level | Icon | Description | Example |
|-------|------|-------------|---------|
| **🔴 Critical** | 🔴 | Causes crash/complete failure | Division by zero, null pointer |
| **🟡 Warning** | 🟡 | May cause unexpected behavior | Logic error, performance issue |
| **🔵 Info** | 🔵 | Best practice/optimization | Variable naming, code style |

**Example Output**:
```
Bugs Found:
1. [CRITICAL] Undefined variable 'result' on Line 15
2. [WARNING] Missing error handling in try block
3. [INFO] Function could use more descriptive name
```

---

### Skill 5: Learning Explanations
**What it does**: Provides educational context about errors.

**Includes**:
- Why the error occurs
- How to prevent it
- Best practices
- Reference documentation

**Example**:
```
Explanation: In Python, variables must be defined before use. This error
occurs because 'x' is referenced in the expression before being assigned a value.
Best Practice: Initialize all variables at the beginning of functions.
Learn More: https://python.org/docs/variables
```

---

## 🔌 Circuit Analysis Skills

### Skill 1: Component Identification
**What it does**: Recognizes electronic components from circuit images.

**Supported Components**:
- Resistors, Capacitors, Inductors
- Diodes, Transistors, ICs
- Op-Amps, Logic Gates
- Power supplies, Switches
- Transformers, Motors

**How to use**:
1. Click "Analyse Circuit" tab
2. Upload circuit image
3. View identified components
4. Copy component details

---

### Skill 2: Pin Configuration Mapping
**What it does**: Explains pin functions and connections.

**Features**:
- Pin numbers and names
- Voltage/current specifications
- Connection recommendations
- Safety ratings

**Example**:
```
Component: LM7805 Voltage Regulator
Pin 1: Input (6-30V) - Connected to +12V
Pin 2: Ground - Connected to GND
Pin 3: Output (5V) - Connected to Load
Current Rating: 1A
Heat Sink Required: Yes (above 500mA)
```

---

### Skill 3: Working Principle Explanation
**What it does**: Explains how circuit components work together.

**Provides**:
- Individual component behavior
- Circuit topology analysis
- Signal flow explanation
- Functional description

---

### Skill 4: Application Scenarios
**What it does**: Suggests real-world uses for the circuit.

**Information Includes**:
- Typical applications
- Operational frequency range
- Power consumption
- Output specifications

---

## 📝 Report Generation Skills

### Skill 1: Automatic Section Extraction
**What it does**: Organizes lab documentation into standard sections.

**Extracts**:
1. **Aim** - What the experiment measures
2. **Theory** - Scientific principles involved
3. **Procedure** - Step-by-step instructions
4. **Observations** - Recorded data
5. **Results** - Analysis and calculations
6. **Conclusion** - Summary and findings

**Input Formats Supported**:
- PDF documents (scanned or digital)
- JPG/PNG images
- Raw text files

---

### Skill 2: Report Structure Generation
**What it does**: Creates properly formatted academic report.

**Output Format**:
```
┌─────────────────────────────────────┐
│ Aim & Objectives                    │
├─────────────────────────────────────┤
│ Underlying Scientific Theory        │
├─────────────────────────────────────┤
│ Experimental Procedure              │
├─────────────────────────────────────┤
│ Observations & Data Tables          │
├─────────────────────────────────────┤
│ Results & Calculations              │
├─────────────────────────────────────┤
│ Conclusion & Findings               │
├─────────────────────────────────────┤
│ Viva Q&A Bank (with difficulty)     │
└─────────────────────────────────────┘
```

---

### Skill 3: Data Organization
**What it does**: Formats observations into clear tables.

**Features**:
- Automatic table generation
- Unit standardization
- Data validation
- Graph readiness

**Example**:
```
| Voltage (V) | Current (mA) | Power (W) |
|-------------|--------------|-----------|
| 1.0         | 2.5          | 0.0025    |
| 2.0         | 5.0          | 0.0100    |
| 5.0         | 12.5         | 0.0625    |
```

---

### Skill 4: Conclusion Writing
**What it does**: Generates summary from analysis.

**Includes**:
- Key findings
- Success criteria met/unmet
- Error analysis
- Recommendations

---

## 🎓 Viva Preparation Skills

### Skill 1: Difficulty-Labeled Questions
**What it does**: Generates questions at specific difficulty levels.

**Difficulty Levels**:

| Level | Preparation Time | Exam Frequency | Example |
|-------|------------------|-----------------|---------|
| **Easy** | 5-10 min | 30% of questions | Basic definitions, formulas |
| **Medium** | 10-20 min | 50% of questions | Application problems, analysis |
| **Hard** | 20+ min | 20% of questions | Design problems, comparisons |

**How to use**:
1. Go to "Viva Prep" tab
2. Enter topic (e.g., "Semiconductor Diodes")
3. Select difficulty level
4. Click "Generate Questions"

---

### Skill 2: Theory Question Generation
**What it does**: Creates questions testing fundamental concepts.

**Question Types**:
- Define key terms
- Explain principles
- Describe relationships
- Compare concepts

**Example**:
```
[EASY] What is forward bias in a P-N junction?
Answer: Forward bias is when a positive voltage is applied to the p-type...

[MEDIUM] Explain the depletion region formation in a P-N junction.
Answer: The depletion region forms due to diffusion of charge carriers...

[HARD] Derive the expression for junction capacitance.
Answer: Junction capacitance is given by: Cj = C₀ / √(1 - V/Vbi)...
```

---

### Skill 3: Application-Based Questions
**What it does**: Tests understanding through real-world scenarios.

**Scenarios Include**:
- Circuit design
- Troubleshooting
- System integration
- Performance optimization

**Example**:
```
[MEDIUM] Design a 5V regulated power supply using LM7805.
Answer: Connect input filter cap to pin 1, output cap to pin 3...

[HARD] A rectifier circuit produces 12V but only gets 9V at load.
Troubleshoot the issue.
Answer: Possible causes: wrong diode rating, poor connections...
```

---

### Skill 4: Numerical Problem Generation
**What it does**: Creates calculation-based questions.

**Topics**:
- Current, voltage, resistance calculations
- Power calculations
- Frequency and impedance
- Efficiency calculations

**Example**:
```
[MEDIUM] Calculate the output voltage of a potential divider circuit.
Given: R1 = 10kΩ, R2 = 20kΩ, Vin = 15V
Find: Vout
Solution: Vout = Vin × R2/(R1+R2) = 15 × 20/30 = 10V
```

---

### Skill 5: Troubleshooting Questions
**What it does**: Tests problem-solving abilities.

**Scenarios**:
- Circuit not working
- Output incorrect
- Component failure
- Signal degradation

**Example**:
```
[HARD] An amplifier has high distortion. List possible causes and fixes.
Answer:
1. Clipping due to high gain → Reduce gain
2. Power supply ripple → Improve filtering
3. Component aging → Replace capacitors
```

---

## 💾 Export & Sharing Skills

### Skill 1: Copy to Clipboard
**What it does**: One-click copy of any content block.

**Usage**:
- Click the 📋 button on any text/code block
- Content copied to clipboard
- Confirmation message appears

**What Can Be Copied**:
- Bug descriptions
- Code snippets
- Component details
- Question answers
- Report sections

---

### Skill 2: Export as Text
**What it does**: Download results as .txt file.

**Contents Include**:
- Full analysis report
- All Q&A pairs
- Metadata (date, time)
- Formatted tables

**File Format**:
```
=== DEBUG CODE ANALYSIS REPORT ===
Generated: 2026-06-11 10:30 AM

BUGS FOUND:
- [CRITICAL] Undefined variable...
- [WARNING] Missing error handling...

CORRECTED CODE:
- Initialize variable x...

EXPLANATIONS:
- Variables must be defined...
```

---

### Skill 3: Export as PDF
**What it does**: Download professionally formatted PDF report.

**PDF Features**:
- ✅ Styled formatting
- ✅ Proper page breaks
- ✅ Table of contents
- ✅ Syntax-highlighted code
- ✅ Color-coded severity badges
- ✅ Page numbers

**Supported Content**:
- Code analysis reports
- Circuit analysis
- Lab reports
- Viva preparation guides

**How to use**:
1. Generate analysis
2. Click "📕 PDF" button
3. Wait for download
4. Open in PDF viewer

---

## 🎨 UI/UX Skills

### Skill 1: Dark/Light Mode Toggle
**What it does**: Switches between theme modes.

**Features**:
- 🌙 Dark mode - Easy on eyes, better for coding
- ☀️ Light mode - Better print quality, easier reading
- Smooth transition animation
- Persistent preference (localStorage)

**How to use**:
- Click theme toggle button in top-right header
- Watch the sliding transition
- Theme saves automatically

**Theme Colors**:
| Mode | Background | Text | Highlights |
|------|-----------|------|-----------|
| Dark | #17232b | #edfafa | #53ffe7 |
| Light | #eaf8fa | #173035 | #0b2429 |

---

### Skill 2: Responsive Design
**What it does**: Adapts interface to screen size.

**Breakpoints**:
- **Desktop** (>820px) - Side-by-side layout
- **Tablet** (600-820px) - Stacked layout with resize
- **Mobile** (<600px) - Full-width stacked

**Features**:
- Touch-friendly buttons
- Readable text sizes
- Proper spacing
- Swipe navigation (coming soon)

---

### Skill 3: Syntax Highlighting
**What it does**: Colors code for readability.

**Supported Languages** (50+):
- JavaScript, Python, Java, C, C++
- MATLAB, Arduino, SQL, HTML, CSS
- Bash, PowerShell, Ruby, Go, Rust
- And more...

**Color Scheme** (Atom One Dark):
```javascript
const x = 10;      // Keyword: blue
const name = "Sam"; // String: green
// Comment: gray
```

---

### Skill 4: Tab Navigation
**What it does**: Easily switch between different analysis tools.

**Available Tabs**:
1. **Debug Code** - Code analysis & fixes
2. **Analyse Circuit** - Component identification
3. **Lab Report** - Report generation
4. **Viva Prep** - Question generation

**Usage**:
- Click tab name to switch
- Active tab highlighted with gradient
- Previous content persists in memory

---

## 🚀 Quick Tips & Tricks

### Tip 1: Batch Operations
```
Upload multiple files one by one:
1. Upload file 1 → Copy results
2. Upload file 2 → Copy results
3. Export combined results
```

### Tip 2: Copy Multiple Blocks
```
Use Ctrl+Click to select multiple:
1. Click 📋 on first item (copies)
2. Ctrl+Click on second item (appends)
3. Paste combined content
```

### Tip 3: PDF Organization
```
Create organized report:
1. Debug Code → Export PDF
2. Circuit Analysis → Export PDF
3. Lab Report → Export PDF
4. Merge PDFs with external tool
```

### Tip 4: Viva Study Plan
```
Recommended study order:
1. Generate EASY questions → Master basics
2. Generate MEDIUM questions → Apply concepts
3. Generate HARD questions → Challenge yourself
4. Review weak areas
5. Final review before viva
```

---

## ⚡ Performance Tips

| Action | Time | Optimization |
|--------|------|--------------|
| Analyze code | 3-5s | Use smaller files first |
| Analyze circuit | 4-6s | Clear image quality |
| Generate report | 5-8s | Structured input text |
| Viva questions | 4-7s | Specific topic name |

---

## 🔗 Keyboard Shortcuts (Coming Soon)

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Copy selected text |
| `Ctrl+P` | Print/PDF export |
| `Tab` | Navigate between fields |
| `Enter` | Submit form |
| `Esc` | Close dialogs |

---

## 📊 Usage Statistics

Track your learning:
- Questions attempted
- Topics covered
- Average difficulty
- Study time

---

**Last Updated**: June 11, 2026  
**Version**: 2.0.0  
**Maintained By**: AI Lab Assistant Team
