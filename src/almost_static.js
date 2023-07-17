const vscode = require('vscode');
const { regex } = require('./regex_pattern.js');

let active_editor = vscode.window.activeTextEditor;
let decoration_type;
let decorations = [];

function updateDecorations() {
    if (!active_editor) return;
    const source_code = active_editor.document.getText();
    const range_function_returns = findRanges(regex.function.declaration, source_code);
    const decorations_function_returns = findDecorations(regex.jsdoc.returns, source_code);
    applyDecorations(range_function_returns, decorations_function_returns);
}

function findRanges(regex, source_code) {
    const ranges = [];
    let match;
    while ((match = regex.exec(source_code)) !== null) {
        ranges.push({ key: match[1], range: createRange(match) });
    }
    return ranges;
}

function createRange(match) {
    const start_position = active_editor.document.positionAt(match.index);
    const end_position = active_editor.document.positionAt(match.index + match[0].length);
    return { range: new vscode.Range(start_position, end_position) };
}

function findDecorations(regex, source_code) {
    let match;
    let i = 0;
    while ((match = regex.exec(source_code)) !== null) {
        decorations.push({ key: i === 0 ? 'leela' : 'ori', decorations: createDecoration(match) });
        i++;
    }
    return decorations;
}

function createDecoration(match) {
    const type = match[1];
    const render_options = {
        after: {
            contentText: `: ${type}`,
            color: '#808080'
        }
    };

    // if (decoration_type) decoration_type.dispose();
    // active_editor.setDecorations(decoration_type, []);

    decoration_type = vscode.window.createTextEditorDecorationType(render_options);
    return decoration_type;
}

function applyDecorations(ranges, decorations) {
    ranges.forEach((range_item) => {
        const { range } = range_item;
        decorations.forEach((decoration_item) => {
            const { decorations } = decoration_item;
            if (range_item['key'] === decoration_item['key']) {
                active_editor.setDecorations(decorations, [range]);
            }
        });
    });
}

function activate(context) {
    let active_editor = vscode.window.activeTextEditor;

    let timeout = undefined;

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

    if (active_editor) triggerUpdateDecorations();

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            active_editor = editor;
            if (editor) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (active_editor && event.document === active_editor.document) {
                decorations.forEach((decoration) => decoration.decorations.dispose());
                triggerUpdateDecorations(true);
            }
        },
        null,
        context.subscriptions
    );
}

module.exports = {
    activate
};
