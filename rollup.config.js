import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import {defineConfig} from 'rollup';
import pkg from './package.json' with {type:'json'};

const external = [
	...Object.keys(pkg.peerDependencies || {}),
];

export default defineConfig([
	{
		// Node ESM
		input:'src/index.tsx',
		output:{
			file:'dist/index.js',
			format:'esm',
			sourcemap:true,
		},
		external:external,
		plugins:[
			resolve(),
			commonjs(),
			typescript({
				declarationDir:'dist',
			}),
		],
	},
	{
		// Node CommonJS
		input:'src/index.tsx',
		output:{
			file:'dist/index.cjs',
			format:'cjs',
			sourcemap:true,
		},
		external:external,
		plugins:[
			resolve(),
			commonjs(),
			typescript({
				declarationDir:'dist',
			}),
		],
	},
	{
		// Browser UMD
		input:'src/index.tsx',
		output:{
			file:'dist/global/index.js',
			format:'umd',
			name:'ReactFormBind', // global module name
			globals:{
				'react':'React',
			},
			sourcemap:true,
		},
		external:external,
		plugins:[
			resolve(),
			commonjs(),
			typescript({
				declaration:false,
			}),
		],
	},
]);
