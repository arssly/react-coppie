var React = require("react");
var Croppie = require("./Croppie.react");

var Thing = React.createClass({
	render(){
		return (
			<div>
				<p>this is gonna hold the avatar editor component</p>
				<Croppie  url="image.jpg" />
			</div>
		)
	}
});

module.exports= Thing;