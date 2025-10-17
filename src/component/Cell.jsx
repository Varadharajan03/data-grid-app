import React from 'react';

const Cell = React.memo(
  ({
    rowIdx,
    colIdx,
    data,
    displayData,
    selection,
    editCell,
    setEditCell,
    setSelection,
    setIsDragging,
    isDragging,
    isFilling,
    setIsFilling,
    getSelectionRange,
    saveEdit,
    editInputRef,
    fillSelectionRef,
    colWidth,
    rowHeight,
    cellStyle,
  }) => {
    const range = getSelectionRange();
    const isSelected =
      rowIdx >= range.minRow &&
      rowIdx <= range.maxRow &&
      colIdx >= range.minCol &&
      colIdx <= range.maxCol;
    const isPrimarySelected =
      rowIdx === selection.startRow && colIdx === selection.startCol;
    const isEditing = editCell?.row === rowIdx && editCell?.col === colIdx;
    const showFillHandle =
      !isEditing && isSelected && rowIdx === range.maxRow && colIdx === range.maxCol;

    let className = "body-cell";
    if (isSelected) className += " selected";
    if (isPrimarySelected && !isFilling) className += " primary-selection";
    if (isFilling) className += " filling";

    const handleMouseDown = (e) => {
      if (e.detail === 2) return;
      setIsDragging(true);
      if (e.shiftKey) {
        setSelection((prev) => ({ ...prev, endRow: rowIdx, endCol: colIdx }));
      } else {
        setSelection({
          startRow: rowIdx,
          startCol: colIdx,
          endRow: rowIdx,
          endCol: colIdx,
        });
      }
    };

    const handleMouseEnter = () => {
      if (isDragging || isFilling) {
        setSelection((prev) => ({ ...prev, endRow: rowIdx, endCol: colIdx }));
      }
    };

    const handleFillMouseDown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      setIsFilling(true);
      fillSelectionRef.current = selection;
    };

    return (
      <td
        className={className}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onDoubleClick={() =>
          setEditCell({ row: rowIdx, col: colIdx, value: data })
        }
        style={{
          width: colWidth,
          height: rowHeight,
          backgroundColor: cellStyle.backgroundColor,
          color: cellStyle.color || "#000",
          fontWeight: cellStyle.fontWeight,
          fontStyle: cellStyle.fontStyle,
          textDecoration: cellStyle.textDecoration,
          fontSize: cellStyle.fontSize,
          textTransform: cellStyle.textTransform,
          fontFamily: cellStyle.fontFamily
        }}
      >
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editCell.value}
            onChange={(e) =>
              setEditCell((prev) => ({ ...prev, value: e.target.value }))
            }
            onBlur={saveEdit}
            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
            style={{
              backgroundColor: cellStyle.backgroundColor,
              color: cellStyle.color || "#000",
              fontWeight: cellStyle.fontWeight,
              fontStyle: cellStyle.fontStyle,
              textDecoration: cellStyle.textDecoration,
              fontSize: cellStyle.fontSize,
              textTransform: cellStyle.textTransform,
              fontFamily: cellStyle.fontFamily
            }}
          />
        ) : (
          displayData
        )}
        {showFillHandle && (
          <div className="fill-handle" onMouseDown={handleFillMouseDown}></div>
        )}
      </td>
    );
  }
);

export default Cell;