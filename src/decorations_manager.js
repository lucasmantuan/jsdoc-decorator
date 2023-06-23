const { findDocParameters, createDecorations } = require('./useful_functions.js');

function decorationsManager(editor) {
    const source_code = editor.document.getText();

    const jsdoc_parameters = findDocParameters(source_code);

    const decorations = createDecorations(source_code, jsdoc_parameters);

    console.log(decorations);
}

module.exports = {
    decorationsManager
};
