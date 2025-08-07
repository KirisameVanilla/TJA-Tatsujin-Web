# ESLint 配置说明

本项目已配置 ESLint 来维护代码质量和一致的代码风格。

## 可用的命令

- `npm run lint` - 检查所有 JavaScript 文件的代码质量和风格问题
- `npm run lint:fix` - 自动修复可以修复的问题

## 配置文件

- `eslint.config.js` - ESLint 主配置文件
- `.eslintignore` - 指定要忽略的文件和目录
- `.vscode/settings.json` - VS Code 编辑器集成设置

## 主要规则

### 代码风格
- 使用 2 空格缩进
- 使用单引号
- 要求分号
- 禁止尾随逗号
- 禁止行末空格

### 最佳实践
- 优先使用 `const`，避免使用 `var`
- 检测未使用的变量
- 规范箭头函数和模板字符串的空格使用

### 当前警告
项目中有以下几个警告是有意保留的：
- `console.log` 语句（用于调试，标记为警告）
- `confirm` 弹窗（用户交互必需，标记为警告）

## VS Code 集成

如果您使用 VS Code，ESLint 将：
- 在保存时自动修复可修复的问题
- 在编辑器中显示问题标记
- 提供代码操作建议

确保安装了 ESLint 扩展：`ms-vscode.vscode-eslint`

## 自定义规则

如需修改规则，请编辑 `eslint.config.js` 文件中的 `rules` 部分。
