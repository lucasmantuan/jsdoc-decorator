const vscode = require('vscode');
const { regex } = require('./regex_pattern.js');

let active_editor = vscode.window.activeTextEditor;
let arrA = [];
let arrB = [];
let arrC = [];

function updateDecorations() {
    if (!active_editor) return;
    const source_code = active_editor.document.getText();
    criarArrA(regex.combo.function.declaration, source_code);
    adicionarNoArrB(arrA, arrB);
    adicionarNoArrC(arrA, arrB, arrC);
    limparArr(arrA, arrB);
    limparArr(arrB, arrC);
    retirarConteudoArrC(arrC);
    exibirConteudoArrB(arrB);
}

function criarArrA(params, code) {
    const matches = code.matchAll(params);
    return Array.from(matches, (match) => {
        const key = criarChaveUnica(match[0]);
        return arrA.push({ key, match, visible: false });
    });
}

function criarChaveUnica(key) {
    return Array.from(key).reduce((hash, char) => hash * 33 * char.charCodeAt(0), 5381) % 1013;
}

function adicionarNoArrB(arrA, arrB) {
    for (const obj of arrA) {
        const exists = arrB.some((item) => item.key === obj.key);
        if (!exists) {
            const match = obj.match[0].match(regex.function.declaration);
            const range = createRange(match, obj.match.index);
            const type = obj.match[0].match(regex.jsdoc.returns)[1];
            const decoration = createDecoration(': ' + type);
            arrB.push({ key: obj.key, range, decoration, visible: obj.visible });
        }
    }
}

function createRange(match, index) {
    const start_position = active_editor.document.positionAt(index + match.index);
    const end_position = active_editor.document.positionAt(index + match.index + match[0].length);
    return { range: new vscode.Range(start_position, end_position) };
}

function createDecoration(text) {
    return vscode.window.createTextEditorDecorationType({
        after: {
            color: '#808080',
            contentText: text,
            fontStyle: 'italic'
        }
    });
}

function adicionarNoArrC(arrA, arrB, arrC) {
    const keys = new Set(arrA.map((item) => item.key));
    arrC.push(...arrB.filter((item) => !keys.has(item.key)));
}

function limparArr(primeiroArr, segundoArr) {
    const keys = new Set(segundoArr.map((item) => item.key));
    primeiroArr.splice(0, primeiroArr.length, ...primeiroArr.filter((item) => !keys.has(item.key)));
}

function exibirConteudoArrB(arrB) {
    arrB.forEach((item) => {
        if (!item.visible) {
            item.visible = true;
            active_editor.setDecorations(item.decoration, [item.range]);
        }
    });
}

function retirarConteudoArrC(arrC) {
    arrC.forEach((item) => {
        item.decoration.dispose();
        // active_editor.setDecorations(item.decoration, []);
    });
    arrC.length = 0;
}

function activate(context) {
    let timeout = undefined;

    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 0);
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
