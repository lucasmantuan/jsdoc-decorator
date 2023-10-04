const regex = {
    jsdoc: {
        name: /@name\s+(\w+)/,
        param: /@param\s+{(\S+?)}\s+(\w+)/,
        returns: /@returns\s+{(\S+?)}/
    },
    function: {
        declaration: /function\s+(\w+)\s*\((.*?)\)/
    },
    comment: {
        function: {
            declaration: /\/\*\*[\s\S]*?function[\s\S]*?{/g
        }
    }
};

module.exports = { regex };
