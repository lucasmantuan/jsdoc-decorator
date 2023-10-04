import { toArray, map, filter, forEach, some, remove, debounce } from 'lodash';
import { window, Range, workspace } from 'vscode';
import { createHash } from 'node:crypto';
import { regex } from './regex_pattern.mjs';

let active_editor = window.activeTextEditor;
let initial_values = [];
let applied_decorations = [];
let decorations_for_removal = [];

function updateDecorations() {
    if (!active_editor) return;
    const source_code = active_editor.document.getText();
    extractInitialValues(regex.comment.function.declaration, source_code);
    createDecorationsToApply(initial_values, applied_decorations);
    filterDecorationsForRemoval(initial_values, applied_decorations, decorations_for_removal);
    removeValues(initial_values, applied_decorations);
    removeValues(applied_decorations, decorations_for_removal);
    removeDecorations(decorations_for_removal);
    applyDecorations(applied_decorations);
}

/**
 * @name criarArrA
 * @param {RegExp} param
 * @param {string} code
 * @returns {void}
 */
function extractInitialValues(param, code) {
    const matches = toArray(code.matchAll(param));
    const unfiltered = map(matches, (match) => {
        const key = createHashCode(match[0]);
        const jsdoc_name = match[0].match(regex.jsdoc.name)[1];
        const function_name = match[0].match(regex.function.declaration)[1];
        if (jsdoc_name === function_name) return { key, match, visible: false };
        return;
    });
    initial_values = filter(unfiltered, (item) => item !== undefined);
}

/**
 * @name createHashCode
 * @param {string} key
 * @returns {string}
 */
function createHashCode(key) {
    const hash = createHash('sha256');
    hash.update(key);
    return hash.digest('hex');
}

/**
 * @name createDecorationsToApply
 * @param {Array} source
 * @param {Array} target
 * @returns {void}
 */
function createDecorationsToApply(source, target) {
    forEach(source, (elements) => {
        const exists = some(target, (item) => item.key === elements.key);
        if (!exists) {
            const match = elements.match[0].match(regex.function.declaration);
            const range = createRange(match, elements.match.index);
            const returns = elements.match[0].match(regex.jsdoc.returns);
            const type = returns === null ? '' : `: ${returns[1]}`;
            const decoration = createDecoration(type);
            target.push({ key: elements.key, range, decoration, visible: elements.visible });
        }
    });
}

/**
 * @name createRange
 * @param {RegExpExecArray} match
 * @param {number} index
 * @returns {Object}
 */
function createRange(match, index) {
    const start_position = active_editor.document.positionAt(index + match.index);
    const end_position = active_editor.document.positionAt(index + match.index + match[0].length);
    return { range: new Range(start_position, end_position) };
}

/**
 * @name createDecoration
 * @param {string} text
 * @returns {Object}
 */
function createDecoration(text) {
    return window.createTextEditorDecorationType({
        after: {
            color: '#808080',
            contentText: text,
            fontStyle: 'italic'
        }
    });
}

/**
 * @name filterDecorationsForRemoval
 * @param {Array} source
 * @param {Array} target
 * @param {Array} result
 * @returns {void}
 */
function filterDecorationsForRemoval(source, target, result) {
    const keys = new Set(map(source, (item) => item.key));
    result.push(...filter(target, (item) => !keys.has(item.key)));
}

/**
 * @name removeValues
 * @param {Array} source
 * @param {Array} target
 * @returns {void}
 */
function removeValues(source, target) {
    const keys = new Set(map(target, (item) => item.key));
    remove(source, (item) => keys.has(item.key));
}

/**
 * @name applyDecorations
 * @param {Array} decorations
 * @returns {void}
 */
function applyDecorations(decorations) {
    forEach(decorations, (item) => {
        if (!item.visible) {
            item.visible = true;
            active_editor.setDecorations(item.decoration, [item.range]);
        }
    });
}

/**
 * @name removeDecorations
 * @param {Array} decorations
 * @returns {void}
 */
function removeDecorations(decorations) {
    forEach(decorations, (item) => {
        item.decoration.dispose();
    });
    decorations.length = 0;
}

function activate(context) {
    const debounceUpdateDecorations = debounce(updateDecorations, 1000);

    if (active_editor) updateDecorations();

    window.onDidChangeActiveTextEditor(
        (editor) => {
            active_editor = editor;
            if (editor) {
                debounceUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    workspace.onDidChangeTextDocument(
        (event) => {
            if (active_editor && event.document === active_editor.document) {
                console.log('onDidChangeTextDocument');
                debounceUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    workspace.onDidCloseTextDocument(() => {
        removeDecorations(applied_decorations);
    });
}

export default {
    activate
};
