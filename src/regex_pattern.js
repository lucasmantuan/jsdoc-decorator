const regex = {
    jsdoc: {
        name: /@name\s*(\w*)/,
        returns: /@returns\s*{(.*)}/
    },
    function: {
        declaration: /\*\/\s*function\s*(.*)\s*\((.*)\)/,
        expression: /\*\/\s*(?:var|let|const)\s*(.*).*=.*function.*\((.*)\)/,
        arrow: /\*\/\s*(?:var|let|const)\s*(.*).*=.*\((.*)\)(.*=>)/
    },
    method: {
        expression: /\*\/\s*(.*).*:.*function.*\((.*)\)/,
        arrow: /\*\/\s*(.*).*:.*\((.*)\)(.*=>)/
    },
    comment: {
        function: {
            declaration: /\*\/\s*function.*{/g,
            expression: /\*\/\s*.*=.*function.*{/g,
            arrow: /\*\/\s*.*=.*=>/g
        },
        method: {
            expression: /\*\/\s*.*:.*function.*{/g,
            arrow: /\*\/\s*.*:.*=>/g
        },
        jsdoc: /\/\*\*[\s\S]*?\*\//g
    }
};

module.exports = { regex };

// expression: /(?:var|let|const)\s+(\w+)\s*=\s*function\s*\((.*?)\)/
// declaration: /\/\*\*[\s\S]*?function[\s\S]*?{/g,
// expression: /\/\*\*[\s\S]*?function[\s\S]*?{/g,
// arrow: /\/\*\*\s.*\s*.+\s+.+\s*\*\/\s*.+=>/g,
// expression_declaration: /\/\*\*[\s\S]*?(\s*=\s*)*?function[\s\S]*?{/g
