const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		/** js scripts */
		sw: path.resolve( __dirname, `src/scripts/sw.js` ),
		'avif-sw': path.resolve( __dirname, 'node_modules/avif.js/avif-sw.js' ),
		'modulr-scripts': path.resolve(
			process.cwd(),
			`src/scripts/scripts.ts`
		),
		'modulr-script-admin': path.resolve(
			process.cwd(),
			`src/scripts/scripts-admin.ts`
		),

		/** scss styles */
		'modulr-css-admin': path.resolve(
			process.cwd(),
			`src/styles/admin.ts`
		),
		'modulr-css-atf': path.resolve( process.cwd(), `src/styles/atf.ts` ),
		'modulr-css-editor': path.resolve(
			process.cwd(),
			`src/styles/editor.ts`
		),
		'modulr-css-main': path.resolve( process.cwd(), `src/styles/main.ts` ),
		'modulr-css-woo': path.resolve( process.cwd(), `src/styles/woo.ts` ),
	},
	devtool: 'source-map',
	module: {
		rules: [
			...defaultConfig.module.rules,
			{
				test: /\.[tjmc]sx?$/,
				use: [ 'babel-loader' ],
				exclude: /node_modules/,
			},
			{
				test: /\.wasm$/,
				loader: 'file-loader',
				generator: {
					filename: '[name].wasm',
				},
			},
		],
		...defaultConfig.module,
	},
};
