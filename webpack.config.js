var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'target/');
var APP_DIR = path.resolve(__dirname, 'src/');

// Is this a production build?
function isProd() {
	return process.env.NODE_ENV === 'production';
}

function getPlugins() {
	var plugins = [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			},
			'DEBUG': !isProd()
		}),
		new webpack.ProvidePlugin({
			jQuery: 'jquery',
			$: 'jquery',
			jquery: 'jquery',
			'window.jQuery': 'jquery',
			THREE: 'three/build/three.module.js'
		})
	];

	if(isProd()) {
		plugins.push(new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,//options.devtool && (options.devtool.indexOf("sourcemap") >= 0 || options.devtool.indexOf("source-map") >= 0),
			compress: true,
			comments: false
		}));
	}

	return plugins;
}

var config = {
	entry: [
		APP_DIR + '/thrower.jsx'
	],
	output: {
		path: BUILD_DIR,
		filename: 'thrower.js'
	},
	module: {
		rules: [{
			test: require.resolve('jquery'),
			loader: 'imports-loader?$=jquery'
		}, {
			test: /.jsx?$/,
			loader: 'babel-loader',
			exclude: /node_modules/,
			include: APP_DIR,
			query: {
				presets: ['es2015', 'react']
			}
		}, {
			test: /\.css$/,
			loader: 'style-loader!css-loader?modules&localIdentName=[local]'
		}, {
			test: /\.(gif|png)$/,
			loader: 'url-loader'
		}, {
			test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
			loader: 'url-loader'
		}]
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		modules: [APP_DIR, 'node_modules']
	},
	plugins: getPlugins()
};

module.exports = config;