import js from '@eslint/js';

export default [
  // ESLint 推荐的规则
  js.configs.recommended,

  {
    // 全局配置
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // 浏览器环境全局变量
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        JSZip: 'readonly',
        navigator: 'readonly',
        CustomEvent: 'readonly'
      }
    },

    // 规则配置
    rules: {
      // 代码风格
      'indent': ['error', 2], // 使用2空格缩进
      'quotes': ['error', 'single'], // 使用单引号
      'semi': ['error', 'always'], // 要求分号
      'comma-dangle': ['error', 'never'], // 禁止尾随逗号
      'no-trailing-spaces': 'error', // 禁止行末空格
      'eol-last': 'error', // 要求文件末尾换行

      // 最佳实践
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }], // 未使用变量警告，忽略以_开头的参数
      'no-console': 'warn', // console 语句警告
      'no-debugger': 'error', // 禁止 debugger
      'no-alert': 'warn', // alert 语句警告
      'prefer-const': 'error', // 优先使用 const
      'no-var': 'error', // 禁止使用 var

      // ES6+
      'arrow-spacing': 'error', // 箭头函数空格
      'template-curly-spacing': 'error', // 模板字符串空格
      'object-curly-spacing': ['error', 'always'], // 对象大括号空格
      'array-bracket-spacing': ['error', 'never'], // 数组方括号空格

      // 函数
      'space-before-function-paren': ['error', 'never'], // 函数名后不要空格
      'function-paren-newline': ['error', 'consistent'], // 函数参数换行保持一致

      // 其他
      'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }], // 限制空行
      'no-mixed-spaces-and-tabs': 'error', // 禁止混用空格和tab
      'no-irregular-whitespace': 'error' // 禁止不规则空白
    }
  },

  {
    // 忽略模式
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      'venv/**',
      'fonts/**'
    ]
  }
];
