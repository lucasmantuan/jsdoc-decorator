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
    const param_decorations = [];
    const returns_decorations = [];

    function_matches.forEach((function_value) => {
        const function_name = function_value[1];
        const lines = source_code.split('\n');

        jsdoc_parameters.forEach((jsdoc_value) => {
            if (jsdoc_value.name === function_name) {
                const line_number = lines.findIndex((line) => line.includes(function_value[0]));

                const all_param_decoration = createParamDecoration(function_value, jsdoc_value, line_number);
                all_param_decoration.forEach((item) => param_decorations.push(item));

                const all_returns_decoration = createReturnsDecoration(function_value, jsdoc_value, line_number);
                all_returns_decoration.forEach((item) => returns_decorations.push(item));
            }
        });
    });

    return [param_decorations, returns_decorations];
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
        all_returns_decoration.push({ range: { function_line, value: function_returns, line_number }, render_options });
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
            all_param_decoration.push({ range: { function_line, value, line_number }, render_options });
        }
    });

    return all_param_decoration;
}

function createRange(function_line, value, line_number) {
    const start_position = new vscode.Position(line_number, function_line.indexOf(value));
    const end_position = new vscode.Position(line_number, start_position.character + value.length);
    const range = { range: new vscode.Range(start_position, end_position) };
    return range;
}

function createType(render_options) {
    return vscode.window.createTextEditorDecorationType(render_options);
}

const mapped_decorations = [];

function createMappedDecoration(editor, decorations) {
    const all_decorations = decorations.flat();

    for (let i = 0; i < all_decorations.length; i++) {
        const { function_line, value, line_number } = all_decorations[i].range;
        const range = createRange(function_line, value, line_number);
        const type = createType(all_decorations[i].render_options);

        // @ts-ignore
        const key = `${range.range.c.c}${range.range.c.e}${range.range.e.e}`;

        const exists = mapped_decorations.some((item) => {
            const exists_key = Object.keys(item)[0];
            return exists_key === key;
        });

        if (!exists) {
            mapped_decorations.push({ [key]: [range, type] });
        }
    }

    applyDecorations(editor, mapped_decorations);
}

function applyDecorations(editor, all_decorations) {
    all_decorations.forEach((item) => {
        const [[range, type]] = Object.values(item);
        editor.setDecorations(type, [range]);
    });
}

module.exports = {
    findDocParameters,
    createDecorations,
    createMappedDecoration
};
