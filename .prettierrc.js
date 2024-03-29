// # DEFAULT
// # arrowParens: 'always'
// # bracketSameLine: false // ** NEW
// # bracketSpacing: true
// # embeddedLanguageFormatting: 'auto'
// # endOfLine: 'lf'
// # filepath: undefined
// # htmlWhitespaceSensitivity: 'css'
// # insertPragma: false
// # jsxBracketSameLine: false
// # jsxSingleQuote: false
// # parser: undefined
// # printWidth: 80
// # proseWrap: 'preserve'
// # quoteProps: 'as-needed'
// # rangeEnd: Infinity
// # requirePragma: false
// # semi: true
// # singleQuote: false
// # tabWidth: 2
// # trailingComma: 'es5'
// # useTabs: false
// # vueIndentScriptAndStyle: false

module.exports = {
  plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
  importOrderSeparation: true,
  importOrderGroupNamespaceSpecifiers: true,
};
