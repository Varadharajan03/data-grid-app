# 📊 Excel-like DataGrid Application

A **React-based spreadsheet** mimicking Microsoft Excel with formulas, formatting, drag-to-fill, and more — built for the **Animaker Frontend Developer Assessment**.

---

## 🚀 Features

- **Editable Cells** — Click to edit, Enter/blur to save, Esc to cancel  
- **Dynamic Grid** — 100 rows × 26+ columns (A-Z, AA-AB...)  
- **Add Rows/Columns** — Ribbon buttons or hover "+" on headers/labels  
- **Drag Selection** — Click and drag to select rectangular ranges  
- **Copy/Cut/Paste** — Ctrl+C, Ctrl+X, Ctrl+V (supports external data)  
- **Formula Support** — Arithmetic (`=A1+B1`), functions (`SUM`, `AVERAGE`, `COUNT`, `MIN`, `MAX`), and cell references (`=A1`, `=B2:B10`)  
- **Fill Handle** — Drag to fill series or patterns  
- **Undo/Redo** — Ctrl+Z, Ctrl+Y  
- **Keyboard Navigation** — Arrow keys, Enter, Tab  
- **Column/Row Reordering** — Drag headers/labels  
- **Resizable Columns/Rows** — Drag edges  
- **Formatting Options** —  
  - Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U)  
  - Font size (10–20px), font family (Arial, Times New Roman, etc.)  
  - Text transform, text & background color pickers  
- **Excel-like Theme** —  
  - Red headers (#ff6b6b)  
  - Green row labels (#51cf66)  
  - White cells (#ffffff)  
  - Blue selection (#e7f3ff)


## 🎯 Data Model

- **Headers:** `['A', 'B', ..., 'Z', 'AA', ...]`  
- **Data:** 2D array `data[row][col]`  
- **Cell Styles:** 2D array for formatting  
- **Column Widths/Row Heights:** Arrays of pixel values  

### Example:
```javascript
data = [
  ['Name', 'Age', 'Bonus', 'Total'],
  ['Varadharajan', '25', '5', '=B2+C2'],
  ['Venkatesan', '30', '10', '=B3+C3'],
  ['Lakshmi', '28', '8', '=B4+C4'],
  ['Sum of Totals', '', '', '=SUM(D2:D4)']
]
```

---

## 🎨 Styling

| Element | Color | Description |
|----------|--------|-------------|
| Header   | `#ff6b6b` | Column headers |
| Row Labels | `#51cf66` | Row numbers |
| Cells | `#ffffff` | Default background |
| Selection | `#e7f3ff` | Active cell/range highlight |
| Borders | `#d1d1d1` | Grid borders |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|-----------|--------|
| Ctrl + C / X / V | Copy / Cut / Paste |
| Ctrl + Z / Y | Undo / Redo |
| Ctrl + B / I / U | Bold / Italic / Underline |
| Arrow Keys | Navigate cells |
| Enter | Edit or confirm edit |
| Delete / Backspace | Clear cell |
| Shift + Arrows | Extend selection |

---

## 🖱️ Mouse Actions

- **Click:** Select cell  
- **Click + Drag:** Select range  
- **Double-click:** Edit cell  
- **Shift + Click:** Extend selection  
- **Drag Fill Handle:** Auto-fill  
- **Drag Header/Label:** Reorder columns/rows  
- **Drag Edge:** Resize column/row  
- **Hover Header/Label:** Show “+” to insert new column/row  

---

## 🧪 Test Cases

| Test | Expected Result |
|------|-----------------|
| Edit a cell | Value updates correctly |
| Add row/column | Appears instantly with default values |
| Copy/Cut/Paste | Works internally and with external data |
| Formula `=A1+B1` | Computes correctly |
| Formula `=SUM(A1:A10)` | Computes range sum |
| Fill handle | Fills pattern |
| Undo/Redo | Reverts/restores actions |
| Resize columns/rows | Updates layout |
| Keyboard navigation | Works smoothly |
| Formatting | Updates cell styles |

---

## 📦 Installation & Setup

```bash
# Clone the repository
git clone <repo-url> && cd datagrid-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:5173

# Deployed URL

https://data-grid-app-nqc1.vercel.app/
```

---

## 🚀 Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel 
   ```

## 🛠️ Technical Details

- **Framework:** React 18  
- **Bundler:** Vite  
- **State Management:** React Hooks (`useState`, `useCallback`, `useMemo`, `useRef`, `useEffect`)  
- **Optimizations:**  
  - `React.memo` to prevent unnecessary re-renders  
  - `useMemo` / `useCallback` for performance  
- **Compatibility:** Chrome, Firefox, Safari, Edge  
- **Restrictions:** No third-party UI or utility libraries allowed

---


