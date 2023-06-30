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

function createMappedDecorations(decorations) {
    const mapped_decorations = [];

    decorations.forEach((item, index) => {
        const { function_line, value, line_number } = item.range;
        const range = createRange(function_line, value, line_number);
        const type = createType(decorations[index].render_options);
        // @ts-ignore
        const key = `${range.range.c.c}${range.range.c.e}${range.range.e.e}${value}`;
        mapped_decorations.push({ range, type, key });
    });

    return mapped_decorations;
}

function getObjectsOnlyInB(arrayA, arrayB) {
    return arrayB.filter((objB) => !arrayA.some((objA) => objA.key === objB.key));
}

function getObjectsOnlyInA(arrayA, arrayB) {
    return arrayA.filter((objA) => !arrayB.some((objB) => objB.key === objA.key));
}

function getObjectsInB(arrayA, arrayB) {
    const onlyA = getObjectsOnlyInA(arrayA, arrayB);
    const keysA = onlyA.map((objA) => objA.key);
    const inB = arrayB.filter((objB) => !keysA.includes(objB.key));
    return inB;
}

let applied_decorations = [];

function manageDecorations(editor, decorations) {
    const arrayA = applied_decorations;
    const arrayB = createMappedDecorations(decorations.flat());

    const onlyA = getObjectsOnlyInA(arrayA, arrayB);
    const onlyB = getObjectsOnlyInB(arrayA, arrayB);
    const inB = getObjectsInB(arrayA, arrayB);

    clearDecorations(editor, onlyA);
    applyDecorations(editor, onlyB);

    applied_decorations = getObjectsInB(arrayA, arrayB);

    // console.log(onlyB);
    // console.log(inB);

    // salva as decorações aplicadas
    // arrayB.forEach((item) => {
    //     applied_decorations.push(item);
    // });

    // const key_decorations_applied = new Set(applied_decorations.map((item) => item.key));
    // const key_new_decorations = new Set(new_decorations.map((item) => item.key));
    // const key_decorations_cleaning = new Set(
    //     [...key_decorations_applied].filter((value) => !key_new_decorations.has(value))
    // );
    // const key_new_decorations_application = new Set(
    //     [...key_new_decorations].filter((valor) => !key_decorations_applied.has(valor))
    // );

    // decorations_cleaning = [];

    // decorations_cleaning = applied_decorations.filter((item) => key_decorations_cleaning.has(item.key));

    // new_decorations_application = new_decorations.filter((item) => !key_new_decorations_application.has(item.key));

    // applied_decorations = applied_decorations.filter(
    //     (first_item) => !new_decorations_application.some((second_item) => first_item.key === second_item.key)
    // );

    // applied_decorations = applied_decorations.filter(
    //     (first_item) => !decorations_cleaning.some((second_item) => first_item.key === second_item.key)
    // );

    // console.log(applied_decorations);
    // console.log(decorations_cleaning);
    // console.log(new_decorations_application);

    // clearDecorations(editor)
    // applyDecorations(editor);
}

function clearDecorations(editor, decorations) {
    decorations.forEach((item) => {
        item.dispose();
        // const type = item.type;
        // editor.setDecorations(type, []);
    });
}

function applyDecorations(editor, decorations) {
    decorations.forEach((item) => {
        const range = item.range;
        const type = item.type;
        editor.setDecorations(type, [range]);
    });
}

module.exports = {
    findDocParameters,
    createDecorations,
    manageDecorations
};
