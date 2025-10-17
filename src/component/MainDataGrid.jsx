import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { evaluateFormula, coordsToCellName } from "../utils/formulaParser.js";
import Cell from "./Cell.jsx";
import RibbonControls from "./RibbonControls.jsx";
import useGridState from "../utils/useGridState.js";

const DataGrid = () => {
  const {
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
    saveEdit
  } = useGridState();

  const editInputRef = useRef(null);
  const fillSelectionRef = useRef(null);

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
  }, [selection, data, editCell, setFormulaBarValue]);

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
    handleToggleUnderline,
    setEditCell,
    setSelection,
    setIsDragging,
    setIsFilling,
    setDragColIdx,
    setDragRowIdx
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
        handleAddColumn={handleAddColumn}
        handleAddRow={handleAddRow}
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
                  onMouseEnter={() => setHoveredColIdx(colIdx)}
                  onMouseLeave={() => setHoveredColIdx(null)}
                >
                  {header}
                  {hoveredColIdx === colIdx && (
                    <button
                      className="add-col-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddColumn(colIdx);
                      }}
                      title="Insert Column After"
                    >
                      +
                    </button>
                  )}
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
                  onMouseEnter={() => setHoveredRowIdx(rowIdx)}
                  onMouseLeave={() => setHoveredRowIdx(null)}
                >
                  {rowIdx + 1}
                  {hoveredRowIdx === rowIdx && (
                    <button
                      className="add-row-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddRow(rowIdx);
                      }}
                      title="Add Row"
                    >
                      +
                    </button>
                  )}
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