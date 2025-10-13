module.exports = {
    extends: ['@commitlint/config-conventional'],
    plugins: [
      {
        rules: {
          'body-requires-what-why-how': ({ body }) => {
            if (!body) {
              return [false, 'Commit body is required with What, Why, How, Impact sections.'];
            }
  
            const hasWhat = /(^|\n)What\s*:/i.test(body);
            const hasWhy = /(^|\n)Why\s*:/i.test(body);
            const hasHow = /(^|\n)How\s*:/i.test(body);
            const hasImpact = /(^|\n)Impact\s*:/i.test(body);
  
            if (!hasWhat || !hasWhy || !hasHow || !hasImpact) {
              return [
                false,
                'Commit body must include sections:\nWhat:\nWhy:\nHow:\nImpact:'
              ];
            }
            return [true];
          },
        },
      },
    ],
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'feat',
          'fix',
          'chore',
          'docs',
          'style',
          'refactor',
          'test',
          'perf',
          'ci',
          'build'
        ],
      ],
      'subject-empty': [2, 'never'],
      'body-leading-blank': [1, 'always'],
      'footer-leading-blank': [1, 'always'],
      'body-requires-what-why-how': [2, 'always'],
    },
  };
  