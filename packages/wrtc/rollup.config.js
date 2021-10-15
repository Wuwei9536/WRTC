import { terser } from 'rollup-plugin-terser';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import image from '@rollup/plugin-image';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'umd/WRTC.js',
      format: 'umd',
      name: 'WRTC',
    },
    plugins: [terser(), webWorkerLoader(), nodeResolve()],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'es/WRTC.js',
      format: 'es',
    },
    plugins: [terser(), webWorkerLoader(), nodeResolve()],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'cjs/WRTC.js',
      format: 'cjs',
      exports: 'default',
    },
    plugins: [terser(), webWorkerLoader(), nodeResolve()],
  },
];