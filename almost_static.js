const vscode = require('vscode');
const { decorationsManager } = require('./src/decorations_manager.js');

function activate(context) {
    const editor = vscode.window.activeTextEditor;
    decorationsManager(editor);

    let disposable = vscode.commands.registerCommand('almost_static.almostStatic', function () {});

    // Executa quando o texto é alterado em um arquivo Javascript
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'javascript') {
            vscode.window.visibleTextEditors.forEach((editor) => {
                if (editor.document === event.document) {
                    decorationsManager(editor);
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

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
