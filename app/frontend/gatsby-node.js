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
