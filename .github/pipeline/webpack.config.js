const path = require("path");
const tsconfig = require("./tsconfig.json");

module.exports = {
  entry: {
    publish: "./src/functions/create-deployments/create-deployments.ts",
    status: "./src/functions/update-deployment-statuses/update-deployment-statuses.ts",
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: ["node_modules", tsconfig.compilerOptions.baseUrl],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
  },
};
