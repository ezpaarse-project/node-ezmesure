module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-multi-spaces': ['error', { exceptions: { VariableDeclarator: true } }],
    'no-use-before-define': ['error', { 'functions': false }],
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off'
  }
}