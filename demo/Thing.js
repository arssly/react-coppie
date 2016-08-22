var React = require("react");
var Croppie = require("react-croppie");

var Thing = React.createClass({
	getInitialState(){
		return {
			result : null
		}
	},
	render(){
		return (
			<div>
				<p>this is gonna hold the avatar editor component</p>
				<Croppie  url="image.jpg" ref="croppie"/>
					<span onClick={this.showResult}>result</span>
				<div style={{height:"200px"}}></div>
				{this.state.result &&
					<img src={this.state.result} alt=""/>
				}
			</div>
		)
	},
	showResult(){
		var self= this;
		this.refs.croppie.result().then( (res)=>{
			this.setState({
				result : res
			});
		});

	}
});

module.exports= Thing;