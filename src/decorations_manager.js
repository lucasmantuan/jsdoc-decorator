// Salva a decoraçao e a identificaçao de onde aplicar em um objeto
// Aplica todas as decorações do objeto
// Criar um debounce para as alterações no código (lodash)

const { findDocParameters, createDecorations } = require('./useful_functions.js');

function decorationsManager(editor) {
    const source_code = editor.document.getText();

    const jsdoc_parameters = findDocParameters(source_code);

    createDecorations(source_code, jsdoc_parameters);
}

module.exports = {
    decorationsManager
};
