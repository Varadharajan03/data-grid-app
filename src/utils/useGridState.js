import { useState, useEffect, useCallback, useRef } from "react";

const useGridState = () => {
  const [headers, setHeaders] = useState(() =>
    Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  );
  
  const [data, setData] = useState(() => {
    const grid = Array(100)
      .fill(null)
      .map(() => Array(26).fill(""));
    grid[0][0] = "Name"; grid[0][1] = "Age"; grid[0][2] = "Bonus"; grid[0][3] = "Total";
    grid[1][0] = "Varadharajan"; grid[1][1] = "25"; grid[1][2] = "5"; grid[1][3] = "=B2+C2";
    grid[2][0] = "Venkatesan"; grid[2][1] = "30"; grid[2][2] = "10"; grid[2][3] = "=B3+C3";
    grid[3][0] = "Lakshmi"; grid[3][1] = "28"; grid[3][2] = "8"; grid[3][3] = "=B4+C4";
    grid[4][0] = "Sum of Totals"; grid[4][3] = "=SUM(D2:D4)";
    return grid;
  });
  
  const [selection, setSelection] = useState({
    startRow: 0,
    startCol: 0,
    endRow: 0,
    endCol: 0,
  });
  
  const [editCell, setEditCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [dragColIdx, setDragColIdx] = useState(null);
  const [dragRowIdx, setDragRowIdx] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [formulaBarValue, setFormulaBarValue] = useState("");
  const [colWidths, setColWidths] = useState(() => Array(26).fill(120));
  const [rowHeights, setRowHeights] = useState(() => Array(100).fill(30));
  const [hoveredColIdx, setHoveredColIdx] = useState(null);
  const [hoveredRowIdx, setHoveredRowIdx] = useState(null);
  const [cellStyles, setCellStyles] = useState(() =>
    Array(100)
      .fill(null)
      .map(() => Array(26).fill({
        backgroundColor: "",
        color: "",
        fontWeight: "",
        fontStyle: "",
        textDecoration: "",
        fontSize: "",
        textTransform: "",
        fontFamily: ""
      }))
  );

  const fillSelectionRef = useRef(null);

  const saveStateToHistory = useCallback(() => {
    const state = {
      data: data.map((r) => [...r]),
      headers: [...headers],
      colWidths: [...colWidths],
      rowHeights: [...rowHeights],
      cellStyles: cellStyles.map((r) => r.map((s) => ({ ...s }))),
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [data, headers, colWidths, rowHeights, cellStyles, history, historyIndex]);

  useEffect(() => {
    saveStateToHistory();
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setData(prevState.data);
      setHeaders(prevState.headers);
      setColWidths(prevState.colWidths);
      setRowHeights(prevState.rowHeights);
      setCellStyles(prevState.cellStyles);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setData(nextState.data);
      setHeaders(nextState.headers);
      setColWidths(nextState.colWidths);
      setRowHeights(nextState.rowHeights);
      setCellStyles(nextState.cellStyles);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const handleAddColumn = useCallback((insertAtIndex = null) => {
    saveStateToHistory();
    
    let newColIndex = headers.length;
    let newHeader = "";
    let tempIndex = newColIndex;
    while (tempIndex >= 0) {
      newHeader = String.fromCharCode(65 + (tempIndex % 26)) + newHeader;
      tempIndex = Math.floor(tempIndex / 26) - 1;
    }
    
    if (insertAtIndex !== null) {
      const targetIndex = insertAtIndex + 1;
      
      setHeaders((prev) => [...prev, newHeader]);
      setColWidths((prev) => [...prev, 120]);
      
      setData((prev) => prev.map((row) => {
        const newRow = [...row];
        newRow.splice(targetIndex, 0, "");
        return newRow;
      }));
      
      setCellStyles((prev) =>
        prev.map((row) => {
          const newRow = [...row];
          newRow.splice(targetIndex, 0, {
            backgroundColor: "",
            color: "",
            fontWeight: "",
            fontStyle: "",
            textDecoration: "",
            fontSize: "",
            textTransform: "",
            fontFamily: "",
          });
          return newRow;
        })
      );
    } else {
      setHeaders((prev) => [...prev, newHeader]);
      setColWidths((prev) => [...prev, 120]);
      setData((prev) => prev.map((row) => [...row, ""]));
      setCellStyles((prev) =>
        prev.map((row) => [
          ...row,
          {
            backgroundColor: "",
            color: "",
            fontWeight: "",
            fontStyle: "",
            textDecoration: "",
            fontSize: "",
            textTransform: "",
            fontFamily: "",
          },
        ])
      );
    }
  }, [headers, saveStateToHistory]);

  const handleAddRow = useCallback((insertAtIndex = null) => {
    saveStateToHistory();
    
    const targetIndex = insertAtIndex !== null ? insertAtIndex + 1 : data.length;
    
    setData((prev) => {
      const newData = [...prev];
      newData.splice(targetIndex, 0, Array(headers.length).fill(""));
      return newData;
    });
    
    setRowHeights((prev) => {
      const newHeights = [...prev];
      newHeights.splice(targetIndex, 0, 30);
      return newHeights;
    });
    
    setCellStyles((prev) => {
      const newStyles = [...prev];
      newStyles.splice(targetIndex, 0, Array(headers.length).fill({
        backgroundColor: "",
        color: "",
        fontWeight: "",
        fontStyle: "",
        textDecoration: "",
        fontSize: "",
        textTransform: "",
        fontFamily: "",
      }));
      return newStyles;
    });
  }, [headers.length, data, saveStateToHistory]);

  const getSelectionRange = useCallback(
    (sel = selection) => {
      return {
        minRow: Math.min(sel.startRow, sel.endRow),
        maxRow: Math.max(sel.startRow, sel.endRow),
        minCol: Math.min(sel.startCol, sel.endCol),
        maxCol: Math.max(sel.startCol, sel.endCol),
      };
    },
    [selection]
  );

  const saveEdit = useCallback(() => {
    if (!editCell) return;
    saveStateToHistory();
    const newData = data.map((r) => [...r]);
    newData[editCell.row][editCell.col] = editCell.value;
    setData(newData);
    setEditCell(null);
  }, [editCell, data, saveStateToHistory]);

  const handleClearCells = useCallback(() => {
    saveStateToHistory();
    const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
    setData((prev) => {
      const newData = prev.map((r) => [...r]);
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newData[r][c] = "";
        }
      }
      return newData;
    });
    setCellStyles((prev) => {
      const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newStyles[r][c] = {
            backgroundColor: "",
            color: "",
            fontWeight: "",
            fontStyle: "",
            textDecoration: "",
            fontSize: "",
            textTransform: "",
            fontFamily: ""
          };
        }
      }
      return newStyles;
    });
  }, [getSelectionRange, saveStateToHistory]);

  const handleCopy = useCallback(() => {
    const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
    const text = data
      .slice(minRow, maxRow + 1)
      .map((row) => row.slice(minCol, maxCol + 1).join("\t"))
      .join("\n");
    navigator.clipboard.writeText(text);
  }, [data, getSelectionRange]);

  const handleCut = useCallback(() => {
    handleCopy();
    handleClearCells();
  }, [handleCopy, handleClearCells]);

  const handlePaste = useCallback(async () => {
    saveStateToHistory();
    const text = await navigator.clipboard.readText();
    const pastedRows = text.split("\n").map((row) => row.split("\t"));
    const { startRow, startCol } = selection;

    setData((prev) => {
      const newData = prev.map((r) => [...r]);
      pastedRows.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
          const rTarget = startRow + rIdx;
          const cTarget = startCol + cIdx;
          if (rTarget < newData.length && cTarget < newData[0].length) {
            newData[rTarget][cTarget] = cell;
          }
        });
      });
      return newData;
    });
  }, [selection, saveStateToHistory]);

  const handleFill = useCallback(() => {
    if (!fillSelectionRef.current) return;
    saveStateToHistory();
    const sourceRange = getSelectionRange(fillSelectionRef.current);
    const targetRange = getSelectionRange(selection);

    const sourceData = data
      .slice(sourceRange.minRow, sourceRange.maxRow + 1)
      .map((r) => r.slice(sourceRange.minCol, sourceRange.maxCol + 1));
    const sourceStyles = cellStyles
      .slice(sourceRange.minRow, sourceRange.maxRow + 1)
      .map((r) => r.slice(sourceRange.minCol, sourceRange.maxCol + 1));

    const sourceHeight = sourceRange.maxRow - sourceRange.minRow + 1;
    const sourceWidth = sourceRange.maxCol - sourceRange.minCol + 1;

    setData((prev) => {
      const newData = prev.map((r) => [...r]);
      for (let r = targetRange.minRow; r <= targetRange.maxRow; r++) {
        for (let c = targetRange.minCol; c <= targetRange.maxCol; c++) {
          const sourceRow = (r - sourceRange.minRow) % sourceHeight;
          const sourceCol = (c - sourceRange.minCol) % sourceWidth;
          newData[r][c] = sourceData[sourceRow][sourceCol];
        }
      }
      return newData;
    });

    setCellStyles((prev) => {
      const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
      for (let r = targetRange.minRow; r <= targetRange.maxRow; r++) {
        for (let c = targetRange.minCol; c <= targetRange.maxCol; c++) {
          const sourceRow = (r - sourceRange.minRow) % sourceHeight;
          const sourceCol = (c - sourceRange.minCol) % sourceWidth;
          newStyles[r][c] = sourceStyles[sourceRow][sourceCol];
        }
      }
      return newStyles;
    });

    fillSelectionRef.current = null;
  }, [data, cellStyles, selection, saveStateToHistory, getSelectionRange]);

  const handleToggleBold = useCallback(() => {
    saveStateToHistory();
    const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
    setCellStyles((prev) => {
      const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newStyles[r][c].fontWeight = newStyles[r][c].fontWeight === "bold" ? "" : "bold";
        }
      }
      return newStyles;
    });
  }, [getSelectionRange, saveStateToHistory]);

  const handleToggleItalic = useCallback(() => {
    saveStateToHistory();
    const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
    setCellStyles((prev) => {
      const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newStyles[r][c].fontStyle = newStyles[r][c].fontStyle === "italic" ? "" : "italic";
        }
      }
      return newStyles;
    });
  }, [getSelectionRange, saveStateToHistory]);

  const handleToggleUnderline = useCallback(() => {
    saveStateToHistory();
    const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
    setCellStyles((prev) => {
      const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newStyles[r][c].textDecoration = newStyles[r][c].textDecoration === "underline" ? "" : "underline";
        }
      }
      return newStyles;
    });
  }, [getSelectionRange, saveStateToHistory]);

  const handleFontSizeChange = useCallback((size) => {
    saveStateToHistory();
    const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
    setCellStyles((prev) => {
      const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newStyles[r][c].fontSize = size;
        }
      }
      return newStyles;
    });
  }, [getSelectionRange, saveStateToHistory]);

  const handleTextTransform = useCallback((transform) => {
    saveStateToHistory();
    const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
    setCellStyles((prev) => {
      const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newStyles[r][c].textTransform = transform;
        }
      }
      return newStyles;
    });
  }, [getSelectionRange, saveStateToHistory]);

  const handleFontFamilyChange = useCallback((font) => {
    saveStateToHistory();
    const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
    setCellStyles((prev) => {
      const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newStyles[r][c].fontFamily = font;
        }
      }
      return newStyles;
    });
  }, [getSelectionRange, saveStateToHistory]);

  const handleBackgroundColorChange = useCallback(
    (color) => {
      saveStateToHistory();
      const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
      setCellStyles((prev) => {
        const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            newStyles[r][c].backgroundColor = color;
          }
        }
        return newStyles;
      });
    },
    [getSelectionRange, saveStateToHistory]
  );

  const handleTextColorChange = useCallback(
    (color) => {
      saveStateToHistory();
      const { minRow, maxRow, minCol, maxCol } = getSelectionRange();
      setCellStyles((prev) => {
        const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            newStyles[r][c].color = color;
          }
        }
        return newStyles;
      });
    },
    [getSelectionRange, saveStateToHistory]
  );

  return {
    // State
    headers,
    setHeaders,
    data,
    setData,
    selection,
    setSelection,
    editCell,
    setEditCell,
    isDragging,
    setIsDragging,
    isFilling,
    setIsFilling,
    dragColIdx,
    setDragColIdx,
    dragRowIdx,
    setDragRowIdx,
    formulaBarValue,
    setFormulaBarValue,
    colWidths,
    setColWidths,
    rowHeights,
    setRowHeights,
    hoveredColIdx,
    setHoveredColIdx,
    hoveredRowIdx,
    setHoveredRowIdx,
    cellStyles,
    setCellStyles,
    
    // Functions
    saveStateToHistory,
    undo,
    redo,
    handleAddColumn,
    handleAddRow,
    handleClearCells,
    handleCopy,
    handleCut,
    handlePaste,
    handleFill,
    handleToggleBold,
    handleToggleItalic,
    handleToggleUnderline,
    handleFontSizeChange,
    handleTextTransform,
    handleFontFamilyChange,
    handleBackgroundColorChange,
    handleTextColorChange,
    getSelectionRange,
    saveEdit,
    fillSelectionRef
  };
};

export default useGridState;