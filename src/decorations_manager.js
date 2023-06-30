const { findDocParameters, createDecorations, manageDecorations } = require('./useful_functions.js');

function insertDecorations(editor) {
    const source_code = editor.document.getText();
    const jsdoc_parameters = findDocParameters(source_code);
    const decorations = createDecorations(source_code, jsdoc_parameters);
    manageDecorations(editor, decorations);
}

module.exports = {
   insertDecorations
};
