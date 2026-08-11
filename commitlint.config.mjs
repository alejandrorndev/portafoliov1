/**
 * Conventional Commits: es la convencion que ya venia usando el repo
 * ("feat: primera carga de este proyecto").
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      1,
      'always',
      [
        'content',
        'i18n',
        'ui',
        'hero',
        'about',
        'skills',
        'projects',
        'experience',
        'contact',
        'seo',
        'a11y',
        'perf',
        'ci',
        'deps',
        'config',
      ],
    ],
  },
}

export default config
