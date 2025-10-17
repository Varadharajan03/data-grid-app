import React from 'react';

const RibbonControls = ({
  handlePaste,
  handleCopy,
  handleCut,
  handleBackgroundColorChange,
  handleTextColorChange,
  handleToggleBold,
  handleToggleItalic,
  handleToggleUnderline,
  handleFontSizeChange,
  handleTextTransform,
  handleFontFamilyChange,
}) => {
  return (
    <div className="excel-ribbon">
      <div className="ribbon-controls">
        {/* Clipboard Group */}
        <div className="ribbon-group">
          <div className="ribbon-button-group">
            <button className="ribbon-button" onClick={handlePaste}>
              <span role="img" aria-label="paste" style={{ fontSize: '22px' }}>📋</span>
              <span>Paste</span>
            </button>
            <button className="ribbon-button" onClick={handleCopy}>
              <span role="img" aria-label="copy" style={{ fontSize: '22px' }}>📄</span>
              <span>Copy</span>
            </button>
            <button className="ribbon-button" onClick={handleCut}>
              <span role="img" aria-label="cut" style={{ fontSize: '22px' }}>✂️</span>
              <span>Cut</span>
            </button>
          </div>
          <span className="group-label">Clipboard</span>
        </div>

        {/* Cell Formatting Group */}
        <div className="ribbon-group">
          <div className="ribbon-button-group">
            <div className="ribbon-sub-buttons">
              <input
                type="color"
                title="Background Color"
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
              />
              <span>Background</span>
            </div>
            <div className="ribbon-sub-buttons">
              <input
                type="color"
                title="Text Color"
                onChange={(e) => handleTextColorChange(e.target.value)}
              />
              <span>Text Color</span>
            </div>
          </div>
          <span className="group-label">Cell Formatting</span>
        </div>

        {/* Text Formatting Group */}
        <div className="ribbon-group">
          <div className="ribbon-button-group">
            <button className="ribbon-button" onClick={handleToggleBold}>
              <span style={{ fontWeight: 'bold' }}>B</span>
              <span>Bold</span>
            </button>
            <button className="ribbon-button" onClick={handleToggleItalic}>
              <span style={{ fontStyle: 'italic' }}>I</span>
              <span>Italic</span>
            </button>
            <button className="ribbon-button" onClick={handleToggleUnderline}>
              <span style={{ textDecoration: 'underline' }}>U</span>
              <span>Underline</span>
            </button>

            <div className="ribbon-sub-buttons">
              <select
                onChange={(e) => handleFontSizeChange(e.target.value)}
                defaultValue=""
                title="Font Size"
              >
                <option value="" disabled>Font Size</option>
                <option value="10px">10</option>
                <option value="12px">12</option>
                <option value="14px">14</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="20px">20</option>
              </select>
            </div>

            <div className="ribbon-sub-buttons">
              <select
                onChange={(e) => handleTextTransform(e.target.value)}
                defaultValue=""
                title="Text Case"
              >
                <option value="" disabled>Text Case</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="ribbon-sub-buttons">
              <select
                onChange={(e) => handleFontFamilyChange(e.target.value)}
                defaultValue=""
                title="Font Family"
              >
                <option value="" disabled>Font Family</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Courier New, monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>
            </div>
          </div>
          <span className="group-label">Text Formatting</span>
        </div>
      </div>
    </div>
  );
};

export default RibbonControls;
