import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { evaluateFormula, coordsToCellName } from "../utils/formulaParser.js";
import Cell from "./Cell.jsx";
import RibbonControls from "./RibbonControls.jsx";

const DataGrid = () => {
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

  const editInputRef = useRef(null);
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

  const displayData = useMemo(
    () => data.map((row) => row.map((cell) => evaluateFormula(cell, data))),
    [data]
  );

  useEffect(() => {
    if (editCell) {
      setFormulaBarValue(editCell.value);
    } else {
      setFormulaBarValue(data[selection.startRow]?.[selection.startCol] || "");
    }
  }, [selection, data, editCell]);

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

  const handleColDragStart = (e, colIdx) => {
    e.dataTransfer.setData("colIdx", colIdx);
    setDragColIdx(colIdx);
  };

  const handleColDragOver = (e, colIdx) => {
    e.preventDefault();
    if (dragColIdx !== null && dragColIdx !== colIdx) {
      e.currentTarget.classList.add("drag-over");
    }
  };

  const handleColDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleColDrop = (e, targetColIdx) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const sourceColIdx = parseInt(e.dataTransfer.getData("colIdx"), 10);
    if (sourceColIdx === targetColIdx) return;

    saveStateToHistory();

    setHeaders((prev) => {
      const newHeaders = [...prev];
      [newHeaders[sourceColIdx], newHeaders[targetColIdx]] = [
        newHeaders[targetColIdx],
        newHeaders[sourceColIdx],
      ];
      return newHeaders;
    });

    setColWidths((prev) => {
      const newWidths = [...prev];
      [newWidths[sourceColIdx], newWidths[targetColIdx]] = [
        newWidths[targetColIdx],
        newWidths[sourceColIdx],
      ];
      return newWidths;
    });

    setData((prev) => {
      const newData = prev.map((row) => [...row]);
      for (let r = 0; r < newData.length; r++) {
        [newData[r][sourceColIdx], newData[r][targetColIdx]] = [
          newData[r][targetColIdx],
          newData[r][sourceColIdx],
        ];
      }
      return newData;
    });

    setCellStyles((prev) => {
      const newStyles = prev.map((r) => r.map((s) => ({ ...s })));
      for (let r = 0; r < newStyles.length; r++) {
        [newStyles[r][sourceColIdx], newStyles[r][targetColIdx]] = [
          newStyles[r][targetColIdx],
          newStyles[r][sourceColIdx],
        ];
      }
      return newStyles;
    });

    setDragColIdx(null);
  };

  const handleRowDragStart = (e, rowIdx) => {
    e.dataTransfer.setData("rowIdx", rowIdx);
    setDragRowIdx(rowIdx);
  };

  const handleRowDragOver = (e, rowIdx) => {
    e.preventDefault();
    if (dragRowIdx !== null && dragRowIdx !== rowIdx) {
      e.currentTarget.classList.add("drag-over");
    }
  };

  const handleRowDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleRowDrop = (e, targetRowIdx) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const sourceRowIdx = parseInt(e.dataTransfer.getData("rowIdx"), 10);
    if (sourceRowIdx === targetRowIdx) return;

    saveStateToHistory();

    setRowHeights((prev) => {
      const newHeights = [...prev];
      [newHeights[sourceRowIdx], newHeights[targetRowIdx]] = [
        newHeights[targetRowIdx],
        newHeights[sourceRowIdx],
      ];
      return newHeights;
    });

    setData((prev) => {
      const newData = [...prev];
      [newData[sourceRowIdx], newData[targetRowIdx]] = [
        newData[targetRowIdx],
        newData[sourceRowIdx],
      ];
      return newData;
    });

    setCellStyles((prev) => {
      const newStyles = [...prev];
      [newStyles[sourceRowIdx], newStyles[targetRowIdx]] = [
        newStyles[targetRowIdx],
        newStyles[sourceRowIdx],
      ];
      return newStyles;
    });

    setDragRowIdx(null);
  };

  const handleColResize = (colIdx, deltaX) => {
    setColWidths((prev) => {
      const newWidths = [...prev];
      newWidths[colIdx] = Math.max(30, newWidths[colIdx] + deltaX);
      return newWidths;
    });
  };

  const handleRowResize = (rowIdx, deltaY) => {
    setRowHeights((prev) => {
      const newHeights = [...prev];
      newHeights[rowIdx] = Math.max(20, newHeights[rowIdx] + deltaY);
      return newHeights;
    });
  };

  const startColResize = (e, colIdx) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[colIdx];

    const onMouseMove = (e) => handleColResize(colIdx, e.clientX - startX);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startRowResize = (e, rowIdx) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = rowHeights[rowIdx];

    const onMouseMove = (e) => handleRowResize(rowIdx, e.clientY - startY);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    if (editCell) editInputRef.current?.focus();
  }, [editCell]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editCell) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "c") {
          e.preventDefault();
          handleCopy();
        }
        if (e.key.toLowerCase() === "x") {
          e.preventDefault();
          handleCut();
        }
        if (e.key.toLowerCase() === "v") {
          e.preventDefault();
          handlePaste();
        }
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          undo();
        }
        if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          redo();
        }
        if (e.key.toLowerCase() === "b") {
          e.preventDefault();
          handleToggleBold();
        }
        if (e.key.toLowerCase() === "i") {
          e.preventDefault();
          handleToggleItalic();
        }
        if (e.key.toLowerCase() === "u") {
          e.preventDefault();
          handleToggleUnderline();
        }
        return;
      }

      let { startRow, startCol } = selection;

      switch (e.key) {
        case "ArrowUp":
          startRow = Math.max(0, startRow - 1);
          break;
        case "ArrowDown":
          startRow = Math.min(data.length - 1, startRow + 1);
          break;
        case "ArrowLeft":
          startCol = Math.max(0, startCol - 1);
          break;
        case "ArrowRight":
          startCol = Math.min(data[0].length - 1, startCol + 1);
          break;
        case "Enter":
          e.preventDefault();
          setEditCell({
            row: startRow,
            col: startCol,
            value: data[startRow][startCol],
          });
          return;
        case "Delete":
        case "Backspace":
          e.preventDefault();
          handleClearCells();
          return;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            setEditCell({ row: startRow, col: startCol, value: e.key });
          }
          return;
      }

      if (e.shiftKey) {
        setSelection((prev) => ({
          ...prev,
          endRow: startRow,
          endCol: startCol,
        }));
      } else {
        setSelection({
          startRow,
          startCol,
          endRow: startRow,
          endCol: startCol,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (isFilling) {
        handleFill();
        setIsFilling(false);
      }
      setDragColIdx(null);
      setDragRowIdx(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    selection,
    editCell,
    data,
    handleCopy,
    handleCut,
    handlePaste,
    undo,
    redo,
    handleClearCells,
    isFilling,
    handleFill,
    handleToggleBold,
    handleToggleItalic,
    handleToggleUnderline
  ]);

  return (
    <div className="excel-container">
      <RibbonControls
        handlePaste={handlePaste}
        handleCopy={handleCopy}
        handleCut={handleCut}
        handleBackgroundColorChange={handleBackgroundColorChange}
        handleTextColorChange={handleTextColorChange}
        handleToggleBold={handleToggleBold}
        handleToggleItalic={handleToggleItalic}
        handleToggleUnderline={handleToggleUnderline}
        handleFontSizeChange={handleFontSizeChange}
        handleTextTransform={handleTextTransform}
        handleFontFamilyChange={handleFontFamilyChange}
      />
      <div className="formula-bar">
        <div className="cell-name-box">{coordsToCellName(selection.startRow, selection.startCol)}</div>
        <div className="formula-input-wrapper">
          <span className="fx-icon">fx</span>
          <input
            type="text"
            className="formula-input"
            value={formulaBarValue}
            onChange={(e) => {
              setFormulaBarValue(e.target.value);
              if (editCell)
                setEditCell((prev) => ({ ...prev, value: e.target.value }));
            }}
            onFocus={() => {
              if (!editCell)
                setEditCell({
                  row: selection.startRow,
                  col: selection.startCol,
                  value: data[selection.startRow][selection.startCol],
                });
            }}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
            }}
          />
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="corner-cell"></th>
              {headers.map((header, colIdx) => (
                <th
                  key={colIdx}
                  className="header-cell"
                  style={{ width: colWidths[colIdx], position: "relative" }}
                  draggable={true}
                  onDragStart={(e) => handleColDragStart(e, colIdx)}
                  onDragOver={(e) => handleColDragOver(e, colIdx)}
                  onDragLeave={handleColDragLeave}
                  onDrop={(e) => handleColDrop(e, colIdx)}
                >
                  {header}
                  <div
                    className="col-resize-handle"
                    onMouseDown={(e) => startColResize(e, colIdx)}
                  ></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ height: rowHeights[rowIdx], position: "relative" }}>
                <td
                  className="label-cell"
                  draggable={true}
                  onDragStart={(e) => handleRowDragStart(e, rowIdx)}
                  onDragOver={(e) => handleRowDragOver(e, rowIdx)}
                  onDragLeave={handleRowDragLeave}
                  onDrop={(e) => handleRowDrop(e, rowIdx)}
                >
                  {rowIdx + 1}
                  <div
                    className="row-resize-handle"
                    onMouseDown={(e) => startRowResize(e, rowIdx)}
                  ></div>
                </td>
                {row.map((cell, colIdx) => (
                  <Cell
                    key={`${rowIdx}-${colIdx}`}
                    rowIdx={rowIdx}
                    colIdx={colIdx}
                    data={cell}
                    displayData={displayData[rowIdx][colIdx]}
                    selection={selection}
                    editCell={editCell}
                    setEditCell={setEditCell}
                    setSelection={setSelection}
                    setIsDragging={setIsDragging}
                    isDragging={isDragging}
                    isFilling={isFilling}
                    setIsFilling={setIsFilling}
                    getSelectionRange={getSelectionRange}
                    saveEdit={saveEdit}
                    editInputRef={editInputRef}
                    fillSelectionRef={fillSelectionRef}
                    colWidth={colWidths[colIdx]}
                    rowHeight={rowHeights[rowIdx]}
                    cellStyle={cellStyles[rowIdx][colIdx]}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="status-bar">
        <div className="sheet-tabs">
          <div className="sheet-tab active">Sheet1</div>
        </div>
        <div className="status-info">Ready</div>
      </div>
    </div>
  );
};

export default DataGrid;