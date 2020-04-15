const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});
module.exports = withMDX({
  // reactStrictMode: true,
  // experimental: {
  //   reactMode: 'concurrent',
  // },
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  webpack: (config) => {
    // Uncomment to profile React in production:
    // Object.assign(config.resolve.alias, {
    //   'react-dom$': 'react-dom/profiling',
    //   'scheduler/tracing': 'scheduler/tracing-profiling',
    // });
    return config;
  },
});
