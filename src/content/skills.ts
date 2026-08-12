import type { SkillCategory } from './types'

/*
 * Extraido de docs/legacy/index.html.
 *
 * El `accent` era `:nth-child(n)` en el CSS original. Ahora es dato: reordenar
 * este array ya no cambia los colores.
 */
export const skillCategories: SkillCategory[] = [
  {
    id: 'backend',
    title: { es: 'Backend', en: 'Backend' },
    accent: 'purple',
    items: [
      { name: 'Node.js', icon: 'devicon-nodejs-plain colored' },
      { name: 'NestJS', icon: 'devicon-nestjs-plain colored' },
      { name: 'Express', icon: 'devicon-express-original' },
      { name: 'Python', icon: 'devicon-python-plain colored' },
      { name: 'Django', icon: 'devicon-django-plain colored' },
      { name: 'PHP', icon: 'devicon-php-plain colored' },
      { name: 'GraphQL', icon: 'devicon-graphql-plain colored' },
      { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
    ],
  },
  {
    id: 'databases',
    title: { es: 'Bases de Datos', en: 'Databases' },
    accent: 'cyan',
    items: [
      { name: 'PostgreSQL', icon: 'devicon-postgresql-plain colored' },
      { name: 'MySQL', icon: 'devicon-mysql-plain colored' },
      { name: 'MongoDB', icon: 'devicon-mongodb-plain colored' },
      { name: 'TypeORM', icon: 'devicon-typescript-plain colored' },
      { name: 'Sequelize', icon: 'devicon-sequelize-plain colored' },
    ],
  },
  {
    id: 'frontend',
    title: { es: 'Frontend', en: 'Frontend' },
    accent: 'pink',
    items: [
      { name: 'JavaScript', icon: 'devicon-javascript-plain colored' },
      { name: 'Angular 19', icon: 'devicon-angularjs-plain colored' },
      { name: 'Vue.js', icon: 'devicon-vuejs-plain colored' },
      { name: 'React.js', icon: 'devicon-react-original colored' },
      { name: 'Tailwind', icon: 'devicon-tailwindcss-plain colored' },
      { name: 'HTML5', icon: 'devicon-html5-plain colored' },
      { name: 'CSS3', icon: 'devicon-css3-plain colored' },
      { name: 'SASS', icon: 'devicon-sass-original colored' },
    ],
  },
  {
    id: 'cloud-devops',
    title: {
      es: 'Cloud, DevOps & Testing',
      en: 'Cloud, DevOps & Testing',
    },
    accent: 'gold',
    items: [
      { name: 'AWS', icon: 'devicon-amazonwebservices-original colored' },
      { name: 'Docker', icon: 'devicon-docker-plain colored' },
      { name: 'Linux', icon: 'devicon-linux-plain colored' },
      { name: 'Git', icon: 'devicon-git-plain colored' },
      { name: 'GitHub Actions', icon: 'devicon-github-original' },
      { name: 'Jest', icon: 'devicon-jest-plain colored' },
      { name: 'Swagger', icon: 'devicon-swagger-plain colored' },
    ],
  },
]
