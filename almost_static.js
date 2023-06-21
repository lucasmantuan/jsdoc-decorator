const vscode = require('vscode');
const { decorationsManager } = require('./src/decorations_manager.js');

function activate(context) {
    const editor = vscode.window.activeTextEditor;
    decorationsManager(editor);

    let disposable = vscode.commands.registerCommand('almost_static.almostStatic', function () {});

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'javascript') {
            vscode.window.visibleTextEditors.forEach((editor) => {
                if (editor.document === event.document) {
                    decorationsManager(editor);
                }
            });
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
