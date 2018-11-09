import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {

  input: 'src/js/kntnt-ma-engagement-metrics',

  output: {
    file: 'dist/js/kntnt-ma-engagement-metrics.min.js',
    format: 'iife',
    sourcemap: false,
  },

  plugins: [

    eslint({
      exclude: [
        'src/styles/**',
      ],
    }),

    resolve(),

    commonjs(),

    babel({
      exclude: 'node_modules/**',
    }),

    (process.env.NODE_ENV === 'production' && uglify()),

  ],

};
