const vscode = require('vscode');
const { regex } = require('./regex_pattern.js');

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

function createDecorations(source_code, jsdoc_parameters) {
    const function_matches = [...source_code.matchAll(regex.function.declaration)];
    const decorations = new Map();

    function_matches.forEach((function_value) => {
        const function_name = function_value[1];
        const lines = source_code.split('\n');

        jsdoc_parameters.forEach((jsdoc_value) => {
            if (jsdoc_value.name === function_name) {
                const line_number = lines.findIndex((line) => line.includes(function_value[0]));

                const all_param_decoration = createParamDecoration(function_value, jsdoc_value, line_number);
                const all_returns_decoration = createReturnsDecoration(function_value, jsdoc_value, line_number);

                [...all_param_decoration, ...all_returns_decoration].forEach(({ range, render_options }) => {
                    decorations.set(range, render_options);
                });
            }
        });
    });

    return decorations;
}

function findDecoration(value, jsdoc_value, type) {
    if (type === 'param') {
        const object_param = jsdoc_value.param.find((item) => value in item);
        return object_param[value];
    } else if (type === 'returns') {
        return jsdoc_value.returns;
    }
}

function createReturnsDecoration(function_value, jsdoc_value, line_number) {
    const function_returns = `(${function_value[2]})`;
    const function_line = function_value[0];
    const returns_decoration = findDecoration(null, jsdoc_value, 'returns');
    const all_returns_decoration = [];

    const render_options = {
        after: {
            contentText: `: ${returns_decoration}`,
            color: '#808080'
        }
    };

    if (function_line.includes(function_returns)) {
        const range = createRange(function_line, function_returns, line_number);
        // decorations.set(range, render_options);
        all_returns_decoration.push({ range, render_options });
    }

    return all_returns_decoration;
}

function createParamDecoration(function_value, jsdoc_value, line_number) {
    const function_param = function_value[2].split(',').map((param) => param.trim());
    const all_param_decoration = [];

    function_param.forEach((value) => {
        const function_line = function_value[0];
        const param_decoration = findDecoration(value, jsdoc_value, 'param');

        const render_options = {
            after: {
                contentText: `: ${param_decoration}`,
                color: '#808080'
            }
        };

        if (function_line.includes(value)) {
            const range = createRange(function_line, value, line_number);
            all_param_decoration.push({ range, render_options });
        }
    });

    return all_param_decoration;
}

function createRange(function_line, value, line_number) {
    const start_index = function_line.indexOf(value);
    const range = new vscode.Range(
        new vscode.Position(line_number, start_index),
        new vscode.Position(line_number, start_index + value.length)
    );

    return range;
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

module.exports = {
    findDocParameters,
    createDecorations
};
