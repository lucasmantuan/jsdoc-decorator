const vscode = require('vscode');
const { regex } = require('./regex_pattern.js');

const decorations = new Map();

function findDocParameters(source_code) {
    const jsdoc_matches = [...source_code.matchAll(regex.jsdoc.comment)];
    const jsdoc_array = jsdoc_matches.map((match) => match[1].trim().split('\n'));
    const jsdoc_result = jsdoc_array.map((item) => item.map((item) => item.trim()));

    const jsdoc_object = jsdoc_result.map((item) => {
        let name = '',
            param = [],
            returns = '';

        item.map((item) => {
            if (item.match(regex.jsdoc.name)) {
                name = item.match(regex.jsdoc.name)[1];
            }
            if (item.match(regex.jsdoc.param)) {
                const param_matches = [...item.matchAll(regex.jsdoc.param)];
                const param_array = param_matches.map((match) => ({ [match[2]]: match[1] }));
                param.push(...param_array);
            }

            if (item.match(regex.jsdoc.returns)) {
                returns = item.match(regex.jsdoc.returns)[1];
            }
        });

        return {
            name,
            param,
            returns
        };
    });

    return jsdoc_object;
}

function findFunctionsParameters(source_code, jsdoc_parameters) {
    const function_matches = [...source_code.matchAll(regex.function.declaration)];

    function_matches.forEach((function_value) => {
        const function_name = function_value[1];
        const lines = source_code.split('\n');

        jsdoc_parameters.forEach((jsdoc_value) => {
            if (jsdoc_value.name === function_name) {
                const line_number = lines.findIndex((line) => line.includes(function_value[0]));
                createParamsDecorations(function_value, jsdoc_value, line_number);
            }
        });
    });
}

function createParamsDecorations(function_value, jsdoc_value, line_number) {
    const function_param = function_value[2].split(',').map((param) => param.trim());

    function_param.map((value) => {
        const function_line = function_value[0];
        const param_decoration = findDecoration(value, jsdoc_value);

        const render_options = {
            after: {
                contentText: `: ${param_decoration}`,
                color: '#808080'
            }
        };

        // separar em outra função a localização do range
        if (function_line.includes(value)) {
            const start_index = function_line.indexOf(value);
            const range = new vscode.Range(
                new vscode.Position(line_number, start_index),
                new vscode.Position(line_number, start_index + value.length)
            );

            decorations.set(range, render_options);
        }
    });
}

// const applyDecorations = (editor) => {
//     const document_text = editor.document.getText();
//     const jsdoc_result = jsdocMatches(document_text);
//     const jsdoc_first_result = jsdoc_result[0];

//     const function_result = functionMatches(document_text, jsdoc_first_result);

//     const decoration_type = vscode.window.createTextEditorDecorationType(function_result.render);
//     const text = function_result.returns;
//     const lines = document_text.split('\n');
//     const decorations = [];

//     for (let i = 0; i < lines.length; i++) {
//         const line = lines[i];

//         if (line.includes(text)) {
//             const start_index = line.indexOf(text);
//             const range = new vscode.Range(
//                 new vscode.Position(i, start_index),
//                 new vscode.Position(i, start_index + text.length)
//             );
//             decorations.push({ range });
//         }
//     }

//     editor.setDecorations(decoration_type, decorations);
// };

function findDecoration(value, jsdoc_value) {
    const object_param = jsdoc_value.param.find((item) => value in item);
    return object_param[value];
}

module.exports = {
    findDocParameters,
    findFunctionsParameters
};
