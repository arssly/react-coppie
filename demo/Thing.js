var React = require("react");
var Croppie = require("../lib/Croppie.react");

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
				<div style={{height:"20px"}}></div>
				{this.state.result
				}
			</div>
		)
	},
	showResult(){
		var self = this;
		this.refs.croppie.result({type:"html",size:{width:250,height:200},circle:false}).then((res)=>{
			this.setState({
				result : res
			});
		});
	}
});

module.exports= Thing;