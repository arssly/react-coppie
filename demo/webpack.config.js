const path = require("path");

module.exports ={
	entry:[
		"./app.js"
	],
	output:{
		filename:"bundle.js"
	},
	resolve: {
		alias: {
			"react-croppie": path.resolve('../lib/Croppie.react.js'),
			"react-dom" : path.resolve('./node_modules/react-dom'),
			"react" 	: path.resolve('./node_modules/react')
		}
	},
	module:{
		loaders:[
			{
				test: /\.js$/,
				loader: 'babel-loader',
				query: {
					presets: ["env", "react"]
				}
			}
		]
	}
};