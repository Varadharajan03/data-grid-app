// src/formulaParser.js

/**
 * Converts a cell name like "A1" or "BC23" to { col, row } coordinates.
 * @param {string} cellName - The name of the cell (e.g., "A1").
 * @returns {{ col: number, row: number } | null}
 */
export const cellNameToCoords = (cellName) => {
  const match = cellName.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;

  const [, colStr, rowStr] = match;
  const row = parseInt(rowStr, 10) - 1;

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 65);
  }
  col -= 1;

  return { col, row };
};

/**
 * Converts column and row index to a cell name (e.g., 0,0 -> "A1").
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {string}
 */
export const coordsToCellName = (row, col) => {
  let colName = "";
  let c = col + 1;
  while (c > 0) {
    const remainder = (c - 1) % 26;
    colName = String.fromCharCode(65 + remainder) + colName;
    c = Math.floor((c - 1) / 26);
  }
  return `${colName}${row + 1}`;
};


/**
 * Evaluates a formula string.
 * @param {string} formula - The formula string (e.g., "=SUM(A1:B2)").
 * @param {Array<Array<any>>} data - The grid data.
 * @returns {any} - The calculated result or an error string.
 */
export const evaluateFormula = (formula, data) => {
  if (typeof formula !== 'string' || !formula.startsWith('=')) {
    return formula;
  }

  const expression = formula.substring(1).toUpperCase();

  const expandRangeToValues = (range) => {
    const [startCell, endCell] = range.split(':');
    const start = cellNameToCoords(startCell);
    const end = cellNameToCoords(endCell) || start;

    if (!start) return [];

    const values = [];
    for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
      for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
        if (data[r] && data[r][c] !== undefined) {
          const val = evaluateFormula(data[r][c], data); // Recursively evaluate
          if (val !== '' && val !== null) {
            values.push(val);
          }
        }
      }
    }
    return values;
  };

  try {
    // Process functions like SUM, AVERAGE, etc.
    let processedExpr = expression.replace(/(SUM|AVERAGE|COUNT|MIN|MAX)\(([A-Z0-9:]+)\)/g, (match, func, range) => {
        const values = expandRangeToValues(range).map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (values.length === 0 && func !== 'COUNT') return 0;
        
        switch (func) {
            case 'SUM':
                return values.reduce((a, b) => a + b, 0);
            case 'AVERAGE':
                return values.reduce((a, b) => a + b, 0) / values.length;
            case 'COUNT':
                return values.length;
            case 'MIN':
                return Math.min(...values);
            case 'MAX':
                return Math.max(...values);
            default:
                return match;
        }
    });

    // Replace individual cell references
    processedExpr = processedExpr.replace(/[A-Z]+\d+/g, (match) => {
      const coords = cellNameToCoords(match);
      if (coords && data[coords.row] && data[coords.row][coords.col] !== undefined) {
        const cellValue = evaluateFormula(data[coords.row][coords.col], data);
        return parseFloat(cellValue) || 0;
      }
      return 0;
    });
    
    // Use Function constructor for safe evaluation of math expressions
    // This will handle basic arithmetic like =A1+B1
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${processedExpr}`)();
    return Number.isFinite(result) ? result : formula; // Return original formula on error

  } catch (error) {
    console.error('Error evaluating formula:', error);
    return '#ERROR!';
  }
};