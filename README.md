# Static web starter kit

Jaye's personal starter kit for gulp/webpack-powered static web projects.

Includes:

- Lints and transpiles javascript with Babel and Webpack
- Compiles sass
- Compresses images
- Hot reloads
- Nunjucks templating, passing in dynamic data specified in the `content.yml` file

Doesn't include:

- Dynamic page generation
- More than one `content.yml` file

## Getting started

Clone the repo, run `npm install` and then use one of the following commands:

- `npm run dev` to start a hot reload server and watch all files for changes
- `npm run build` to create a production build in the `/dist` folder
- `npm run lint` to just check for JS style guide violations

Lint problems will break builds

## Putting it on the web

Comes with a `netlify.toml` file for fast CI/CD deployment to [Netlify](http://netlify.com).

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jhackett1/static-starter-kit)