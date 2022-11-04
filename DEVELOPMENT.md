# Peasy Lighting

## Start dev web server

    npm start

Note that Peasy Lighting comes with a dev-app. The above command starts the dev app in `dev-app/` folder. The plugin source code is in `src/` folder.

## Build Peasy Lighting production modern

    npm run build

It builds Peasy Lighting into `dist/index.js` file.

Note when you do `npm publish` or `npm pack` to prepare the Peasy Lighting package, it automatically runs the above build command by the `prepare` script defined in your `package.json` `"scripts"` section.

## Consume the Peasy Lighting

Peasy Lighting is published to npm so just install the `package.json`

    npm install peasy-lighting

If you want to directly use plugin's git repo.

    npm install git@github.com:username/peasy-lighting.git

or

    npm install https://some.git.server/username/peasy-lighting.git

If you want to install from local folder, don't do "npm install ../local/peasy-lighting/" as the folder's `node_modules/` might cause webpack to complain. Instead, do

    npm pack

which will pack Peasy Lighting into `peasy-lighting` to be consumed with

```ts
import * as Lighting from 'peasy-lighting';
```

## Analyze webpack bundle

    npm run analyze

## Acknowledgements

Peasy Lighting's project structure is derived from [aurelia/new](https://github.com/aurelia/new).
