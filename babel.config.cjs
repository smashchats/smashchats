module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            // '@nkzw/babel-preset-fbtee',
            ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
            ['@babel/preset-react', { runtime: 'automatic' }],
            // 'nativewind/babel',
        ],
        plugins: [["inline-import", { extensions: [".sql"] }]],
    };
};
