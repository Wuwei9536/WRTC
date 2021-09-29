import { terser } from 'rollup-plugin-terser';
export default [
  {
    input: 'src/index.js',
    output: {
      file: 'umd/WRTC.js',
      format: 'umd',
      name: 'WRTC',
    },
    // plugins: [terser()],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'es/WRTC.js',
      format: 'es',
      name: 'WRTC',
    },
    // plugins: [terser()],
  },
];
