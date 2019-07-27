module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        '@vue/standard'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        "eol-last": ["off"], //换行
        "indent": ["error", 2], //强制使用一致的缩进 (indent)
        "no-multiple-empty-lines": [0],
        "space-before-function-paren": 0,
        "eqeqeq":[0]
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
