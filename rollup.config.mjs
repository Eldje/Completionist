import deckyPlugin from "@decky/rollup";

const config = deckyPlugin({
  // options
});

config.output = {
  file: 'dist/index.js',
  format: 'iife',
  name: 'plugin_export', // 'default' était interdit, 'plugin_export' est parfait
  exports: 'default',
  extend: true,          // Autorise Rollup à être plus flexible sur le nommage
  globals: {
    "react": "React",
    "react-dom": "ReactDOM",
    "decky-frontend-lib": "deckyFrontendLib"
  }
};

export default config;