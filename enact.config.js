const webpack = require('webpack');

module.exports = {
  webpack: (config) => {
    config.plugins.push(new webpack.ProvidePlugin({ process: 'process/browser' }));
    config.resolve = config.resolve || {};
    config.resolve.fallback = { ...(config.resolve.fallback || {}), process: require.resolve('process/browser') };

    return config;
  }
};
