const regex = {
    jsdoc: {
        comment: /\/\*\*([\s\S]*?)\*\//g,
        name: /@name\s+(\w+)/,
        param: /@param\s+{(\S+?)}\s+(\w+)/g,
        returns: /@returns\s+{(\S+?)}/
    },
    function: {
        declaration: /function\s+(\w+)\s*\((.*?)\)/
    },
    combo: {
        function: {
            declaration: /\/\*\*[\s\S]*?function[\s\S]*?{/g
        }
    }
};

module.exports = { regex };
