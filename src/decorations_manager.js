const { findDocParameters, createDecorations, createMappedDecoration } = require('./useful_functions.js');

function decorationsManager(editor) {
    const source_code = editor.document.getText();

    const jsdoc_parameters = findDocParameters(source_code);

    const decorations = createDecorations(source_code, jsdoc_parameters);

    createMappedDecoration(editor, decorations);
}

module.exports = {
    decorationsManager
};
