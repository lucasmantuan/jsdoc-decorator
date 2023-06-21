const regex = {
    jsdoc: {
        comment: /\/\*\*([\s\S]*?)\*\//g,
        name: /@name\s+(\w+)/,
        param: /@param\s+{(\S+?)}\s+(\w+)/g,
        returns: /@returns\s+{(\S+?)}/
    }
};

module.exports = { regex };
