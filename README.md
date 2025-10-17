```markdown
# Excel-like DataGrid Application

A React-based spreadsheet mimicking Excel with formulas, formatting, drag-to-fill, and more.

## 🚀 Features
- **Editable Cells**: Click to edit, Enter/blur to save, Esc to cancel
- **Dynamic Grid**: 100 rows × 26+ columns (A-Z, AA-AB...)
- **Add Rows/Columns**: Ribbon buttons or hover "+" on headers/labels
- **Drag Selection**: Click and drag for rectangular ranges
- **Copy/Cut/Paste**: Ctrl+C, Ctrl+X, Ctrl+V (supports external data)
- **Formula Support**: Arithmetic (`=A1+B1`), functions (`SUM`, `AVERAGE`, `COUNT`, `MIN`, `MAX`), cell references (`=A1`, `=B2:B10`)
- **Fill Handle**: Drag to fill cells
- **Undo/Redo**: Ctrl+Z, Ctrl+Y
- **Keyboard Navigation**: Arrow keys, Enter, Tab
- **Column/Row Reordering**: Drag headers/labels
- **Resizable Columns/Rows**: Drag edges
- **Formatting**: Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U), font size (10-20px), font family (Arial, Times New Roman, etc.), text transform, color pickers
- **Excel-like Theme**: Red headers (#ff6b6b), green row labels (#51cf66), white cells (#ffffff), blue selection (#e7f3ff)

## 📦 Installation
1. Clone: `git clone <repo-url> && cd datagrid-app`
2. Install: `npm install` or `yarn install`
3. Start: `npm run dev` or `yarn dev`
4. Open: `http://localhost:5173`

## 🏗️ Project Structure
```
src/
├── components/
│   ├── DataGrid.jsx
│   ├── Cell.jsx
│   ├── RibbonControls.jsx
│   ├── FormulaBar.jsx
│   └── SpreadsheetTable.jsx
├── hooks/
│   ├── useSpreadsheetData.js
│   ├── useSpreadsheetActions.js
│   ├── useSpreadsheetFormatting.js
│   └── useSpreadsheetEvents.js
├── utils/
│   └── formulaParser.js
├── styles/
│   └── style.css
└── App.js
```

## 🎯 Data Model
- **Headers**: `['A', 'B', ..., 'Z', 'AA', ...]`
- **Data**: 2D array `data[row][col]`
- **Cell Styles**: 2D array for formatting
- **Column Widths/Row Heights**: Pixel value arrays
- **Example**:
```javascript
data = [
  ['Name', 'Age', 'Bonus', 'Total'],
  ['Varadharajan', '25', '5', '=B2+C2'],
  ['Venkatesan', '30', '10', '=B3+C3'],
  ['Lakshmi', '28', '8', '=B4+C4'],
  ['Sum of Totals', '', '', '=SUM(D2:D4)']
]
```

## 🎨 Styling
- Headers: #ff6b6b
- Labels: #51cf66
- Cells: #ffffff
- Selection: #e7f3ff
- Borders: #d1d1d1

## ⌨️ Keyboard Shortcuts
- Ctrl+C/X/V: Copy/Cut/Paste
- Ctrl+Z/Y: Undo/Redo
- Ctrl+B/I/U: Bold/Italic/Underline
- Arrow Keys: Navigate
- Enter: Edit
- Delete/Backspace: Clear
- Shift+Arrows: Extend selection

## 🖱️ Mouse Actions
- Click: Select cell
- Click+Drag: Select range
- Double-click: Edit
- Shift+Click: Extend selection
- Drag fill handle: Fill pattern
- Drag header/label: Reorder
- Drag edge: Resize
- Hover header/label: Show "+" to insert

## 🧪 Test Cases
- Edit cell, save
- Add row/column
- Select, copy, cut, paste
- Formula evaluation (`=A1+B1`, `=SUM(A1:A10)`)
- Fill handle, undo/redo
- Reorder/resize columns/rows
- Paste external data
- Keyboard navigation, formatting

## 🚀 Deployment
1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel`
3. Or use GitHub integration in Vercel dashboard

## 🛠️ Technical Details
- **Built With**: React 18, Vite, Hooks (useState, useCallback, useMemo, useRef, useEffect)
- **Optimizations**: React.memo, useMemo, useCallback, minimal re-renders
- **Compatibility**: Chrome, Firefox, Safari, Edge

## 🤝 Contributing
1. Fork repo
2. Create branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📝 Future Enhancements
- Cell merging
- Freeze panes
- Advanced formulas (IF, VLOOKUP)
- Charts/graphs
- Export/Import CSV/Excel
- Multi-sheet support
- Cell validation
- Context menu
- Search/replace
- Conditional formatting

