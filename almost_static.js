const _ = require('lodash');
const vscode = require('vscode');
const { insertDecorations } = require('./src/decorations_manager.js');

const debounceIncertDecorations = _.debounce(insertDecorations, 1000);

function activate(context) {
    const editor = vscode.window.activeTextEditor;

    insertDecorations(editor);

    let disposable = vscode.commands.registerCommand('almost_static.almostStatic', function () {
        // insertDecorations(editor);
    });

    // Executa quando o texto é alterado em um arquivo Javascript
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'javascript') {
            // vscode.window.visibleTextEditors.forEach((editor) => {
            vscode.window.visibleTextEditors.forEach(() => {
                if (editor.document === event.document) {
                    debounceIncertDecorations(editor);
                }
            });
        }
    });

    // Executa quando um arquivo Javascript existente é aberto
    // vscode.window.onDidChangeActiveTextEditor((editor) => {
    //     if (editor && editor.document.languageId === 'javascript') {
    //         decorationsManager(editor);
    //     }
    // });

    // vscode.window.visibleTextEditors.forEach((editor) => {
    //     if (editor.document.languageId === 'javascript') {
    //         applyDecorations(editor);
    //     }
    // });

    // vscode.workspace.onDidOpenTextDocument((document) => {
    //     if (document.languageId === 'javascript') {
    //         vscode.window.visibleTextEditors.forEach((editor) => {
    //             if (editor.document === document) {
    //                 applyDecorations(editor);
    //             }
    //         });
    //     }
    // });

    context.subscriptions.push(disposable);
}

module.exports = {
    activate
};
