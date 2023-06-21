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

module.exports = {
    findDocParameters
};
