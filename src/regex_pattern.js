const regex = {
    jsdoc: {
        comment: /\/\*\*([\s\S]*?)\*\//g,
        name: /@name\s+(\w+)/,
        param: /@param\s+{(\S+?)}\s+(\w+)/g,
        returns: /@returns\s+{(\S+?)}/
    },
    function: {
        declaration: /function\s+(\w+)\s*\((.*?)\)/g
    }
};

module.exports = { regex };
