const vscode = require('vscode');

function activate(context) {
    let timeout = undefined;
    let activeEditor = vscode.window.activeTextEditor;

    const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'blue',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            borderColor: 'darkblue'
        },
        dark: {
            borderColor: 'lightblue'
        }
    });

    const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
        cursor: 'crosshair',
        backgroundColor: { id: 'myextension.largeNumberBackground' }
    });

    function updateDecorations() {
        if (!activeEditor) return;

        const text = activeEditor.document.getText();

        const regex = /\d+/g;
        let match;

        const smallNumbers = [];
        const largeNumbers = [];

        while ((match = regex.exec(text))) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const decoration = {
                range: new vscode.Range(startPos, endPos),
                hoverMessage: 'Number **' + match[0] + '**'
            };
            if (match[0].length < 3) {
                smallNumbers.push(decoration);
            } else {
                largeNumbers.push(decoration);
            }
        }

        activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
        activeEditor.setDecorations(largeNumberDecorationType, largeNumbers);
    }

    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        } else {
            updateDecorations();
        }
    }

    if (activeEditor) triggerUpdateDecorations();

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            activeEditor = editor;
            if (editor) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations(true);
            }
        },
        null,
        context.subscriptions
    );
}

exports.activate = activate;
