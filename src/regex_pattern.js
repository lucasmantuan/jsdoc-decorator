const regex = {
    jsdoc: {
        comment: /\/\*\*([\s\S]*?)\*\//g,
        name: /@name\s+(\w+)/g,
        param: /@param\s+{(\S+?)}\s+(\w+)/g,
        returns: /@returns\s+{(\S+?)}/g
    },
    function: {
        declaration: /function\s+(\w+)\s*\((.*?)\)/g
    }
};

module.exports = { regex };
