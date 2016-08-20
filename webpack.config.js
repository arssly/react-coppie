var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: [
		'./src/app.js'
	],
	output: {
		filename: 'croppieReact.js'
	},
	devtool: 'eval',
	module: {
		loaders: [
			{
				test: /\.js$/,
				include: path.join(__dirname, 'src'),
				loader: 'babel-loader',
				query: {
					presets: ["es2015","react"]
				}
			},
			{test:/\.json$/,loader:'json-loader'},
			{ test: /\.less$/, loader: 'style-loader!css-loader' },
			{ test: /\.(woff2?|eot|ttf|svg)$/, loader: 'url?limit=10000' }
		]
	},
	debug: false
};