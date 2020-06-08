import path from 'path';
import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import buble from "rollup-plugin-buble";
import serve from "rollup-plugin-serve";
import postcss from "rollup-plugin-postcss";

const CONFIG = {
  input: "",
  output: {
    customElement: true,
    sourcemap: true,
    format: "iife",
    name: "app",
    dir: "public/bundle"
  },
  plugins: [
    svelte(),
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
		postcss({
			extensions: ['.scss', '.sass'],
			extract: false,
			minimize: true,
			use: [
				['sass', {
					includePaths: [
					'./src/theme',
					'./node_modules',
					path.resolve(__dirname, '..', 'node_modules')
				]
				}]
			]
		}),
    buble({ transforms: { forOf: false } }),
    serve("public"),
    livereload({ watch: "public" })
  ]
};

export default [
  { ...CONFIG, input: "example1.js" },
  { ...CONFIG, input: "example2.js" },
  { ...CONFIG, input: "example3.js" }
];
