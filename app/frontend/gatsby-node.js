/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

exports.onCreateWebpackConfig = ({ stage, loaders, plugins, actions }) => {
  if (stage === 'build-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          // TODO this should be commented to run the develop mode
          {
            test: /react-ace/,
            use: loaders.null(),
          },
          /* TODO if this two are commented, the graphs do not work in build
          {
            test: /immutable-devtools/,
            use: loaders.null(),
          },
          {
            test: /pondjs/,
            use: loaders.null(),
          },
          {
            test: /react-timeseries-charts/,
            use: loaders.null(),
          },
          */
        ],
      },
      plugins: [
        plugins.define({
          HTMLElement: {},
          window: {},
        }),
      ],
    });
  }
};

// TODO gatbsy build does not know this api
/*
exports.modifyBabelrc = ({ babelrc }) => ({
  ...babelrc,
  plugins: babelrc.plugins.concat(['transform-regenerator']),
});
*/

/*
exports.modifyWebpackConfig = function(config, env) {
  if (env === 'build-javascript' || env === 'develop') {
    const previous = config.resolve().entry;
    config._config.entry = [];
    config.merge({
      entry: ['babel-polyfill'].concat(previous),
    });
  }
  return config;
};
*/
