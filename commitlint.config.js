// One list for both type-enum and header-pattern, so the two rules cannot drift apart.
const types = [
  'feat', // New features
  'fix', // Bug fixes
  'style', // UI/styling changes
  'refactor', // Code refactoring
  'perf', // Performance improvements
  'test', // Tests
  'docs', // Documentation
  'chore', // Build/tooling
  'deploy', // Deployment
  'enhance', // Enhancements
  'content', // Commits from the admin editor (/admin/content), straight to main
];

const headerPattern = new RegExp(String.raw`^([\p{Emoji}][‍️]* )?(${types.join('|')})(\(.+\))?: .+$`, 'u');

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Disable default rules that conflict with emoji format
    'subject-empty': [0],
    'type-empty': [0],
    'type-enum': [2, 'always', types],
    'subject-min-length': [2, 'always', 1],
    'subject-max-length': [2, 'always', 100],
    'subject-case': [0],
    'header-max-length': [2, 'always', 120],
    // Custom rule to allow any emoji at the start
    'header-pattern': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'header-pattern'({header}) {
          if (!headerPattern.test(header)) {
            return [
              false,
              `Header must match format: [emoji] <type>[(scope)]: <description>

Valid types: ${types.join(', ')}

Examples:
  feat: add new feature
  fix: resolve bug in component
  chore: update dependencies
  chore(deps): update dependency xyz`,
            ];
          }

          return [true];
        },
      },
    },
  ],
};
