const webpack = require('webpack');

module.exports = {
  webpack: (config) => {
    // process polyfill (browser)
    config.plugins.push(new webpack.ProvidePlugin({ process: 'process/browser' }));
    // ha kell fallback:
    config.resolve = config.resolve || {};
    config.resolve.fallback = { ...(config.resolve.fallback || {}), process: require.resolve('process/browser') };

    // opcionális: env értékek becserélése build időben
    // config.plugins.push(new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    // }));

    return config;
  }
};