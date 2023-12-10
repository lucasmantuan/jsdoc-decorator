const _ = require('lodash');
const vscode = require('vscode');
const { createHash } = require('node:crypto');
const { regex } = require('./regex_pattern.js');

let active_editor = vscode.window.activeTextEditor;
let initial_values = [];
let applied_decorations = [];
let decorations_for_removal = [];

function updateDecorations() {
    if (!active_editor) return;

    const source_code = active_editor.document.getText();

    const function_declaration = extractInitialValues(
        regex.comment.jsdoc,
        regex.comment.function.declaration,
        regex.jsdoc.name,
        regex.function.declaration,
        source_code
    );

    const function_expression = extractInitialValues(
        regex.comment.jsdoc,
        regex.comment.function.expression,
        regex.jsdoc.name,
        regex.function.expression,
        source_code
    );

    const function_arrow = extractInitialValues(
        regex.comment.jsdoc,
        regex.comment.function.arrow,
        regex.jsdoc.name,
        regex.function.arrow,
        source_code
    );

    const method_expression = extractInitialValues(
        regex.comment.jsdoc,
        regex.comment.method.expression,
        regex.jsdoc.name,
        regex.method.expression,
        source_code
    );

    const method_arrow = extractInitialValues(
        regex.comment.jsdoc,
        regex.comment.method.arrow,
        regex.jsdoc.name,
        regex.method.arrow,
        source_code
    );

    initial_values = _.concat(
        function_declaration,
        function_expression,
        function_arrow,
        method_expression,
        method_arrow
    );

    createDecorationsToApply(initial_values, applied_decorations, regex.function.declaration, regex.jsdoc.returns);
    createDecorationsToApply(initial_values, applied_decorations, regex.function.expression, regex.jsdoc.returns);
    createDecorationsToApply(initial_values, applied_decorations, regex.function.arrow, regex.jsdoc.returns);
    createDecorationsToApply(initial_values, applied_decorations, regex.method.expression, regex.jsdoc.returns);
    createDecorationsToApply(initial_values, applied_decorations, regex.method.arrow, regex.jsdoc.returns);

    filterDecorationsForRemoval(initial_values, applied_decorations, decorations_for_removal);
    removeValues(initial_values, applied_decorations);
    removeValues(applied_decorations, decorations_for_removal);
    removeDecorations(decorations_for_removal);
    applyDecorations(applied_decorations);
}

function extractInitialValues(rgx1, rgx2, rgx3, rgx4, code) {
    const matches_jsdoc = _.toArray(code.matchAll(rgx1));
    const matches_code = _.toArray(code.matchAll(rgx2));
    const result = [];
    _.forEach(matches_jsdoc, (match_jsdoc) => {
        const jsdoc_name = match_jsdoc[0].match(rgx3);
        _.forEach(matches_code, (match_code) => {
            const code_name = match_code[0].match(rgx4);
            try {
                if (jsdoc_name[1].trim() === code_name[1].trim()) {
                    const key = createHashCode(match_jsdoc[0] + match_code[0]);
                    result.push({ key, code: match_code, doc: match_jsdoc, visible: false });
                }
            } catch (error) {
                console.log(error.message);
            }
        });
    });
    return result;
}

// function extractInitialValues(rgx1, rgx2, rgx3, code) {
//     const matches = _.toArray(code.matchAll(rgx1));
//     const unfiltered = _.map(matches, (match) => {
//         const key = createHashCode(match[0]);
//         const jsdoc_name = match[0].match(rgx2);
//         const code_name = match[0].match(rgx3);
//         if (code_name !== null) {
//             if (jsdoc_name[1] === code_name[1]) {
//                 return { key, match, visible: false };
//             }
//         }
//         return;
//     });
//     return _.filter(unfiltered, (item) => item !== undefined);
// }

// function extractInitialValues(param, code) {
//     const matches = _.toArray(code.matchAll(param));
//     const unfiltered = _.map(matches, (match) => {
//         const key = createHashCode(match[0]);
//         const jsdoc_name = match[0].match(regex.jsdoc.name)[1];

//         if (match[1] === undefined) {
//             const function_declaration_name = match[0].match(regex.function.declaration)[1];
//             if (jsdoc_name === function_declaration_name) return { key, match, visible: false };
//         } else {
//             const function_expression_name = match[0].match(regex.function.expression)[1];
//             if (jsdoc_name === function_expression_name) return { key, match, visible: false };
//         }

//         return;
//     });
//     return _.filter(unfiltered, (item) => item !== undefined);
// }

function createHashCode(key) {
    const hash = createHash('sha256');
    hash.update(key);
    return hash.digest('hex');
}

function createDecorationsToApply(source, target, rgx1, rgx2) {
    _.forEach(source, (element) => {
        const exists = _.some(target, (item) => item.key === element.key);
        if (!exists) {
            const match_code = element.code[0].match(rgx1);
            if (match_code !== null) {
                const adjustment = match_code[3] !== undefined ? match_code[3].length : 0;
                const range = createRange(match_code, element.code.index, adjustment);
                const match_doc = element.doc[0].match(rgx2);
                const type = match_doc === null ? '' : `: ${match_doc[1]}`;
                const decoration = createDecoration(type);
                target.push({ key: element.key, range, decoration, visible: element.visible });
            }
        }
    });
}

function createRange(match, index, adjustment) {
    const start_position = active_editor.document.positionAt(index + match.index);
    const end_position = active_editor.document.positionAt(index + match.index + match[0].length - adjustment);
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

function filterDecorationsForRemoval(source, target, result) {
    const keys = new Set(_.map(source, (item) => item.key));
    result.push(..._.filter(target, (item) => !keys.has(item.key)));
}

function removeValues(source, target) {
    const keys = new Set(_.map(target, (item) => item.key));
    _.remove(source, (item) => keys.has(item.key));
}

function applyDecorations(decorations) {
    _.forEach(decorations, (item) => {
        if (!item.visible) {
            item.visible = true;
            active_editor.setDecorations(item.decoration, [item.range]);
        }
    });
}

function removeDecorations(decorations) {
    _.forEach(decorations, (item) => {
        item.decoration.dispose();
    });
    decorations.length = 0;
}

function activate(context) {
    const debounceUpdateDecorations = _.debounce(updateDecorations, 1000);

    if (active_editor) updateDecorations();

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            active_editor = editor;
            if (editor) {
                debounceUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (active_editor && event.document === active_editor.document) {
                debounceUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidCloseTextDocument(() => {
        removeDecorations(applied_decorations);
    });
}

module.exports = {
    activate
};
