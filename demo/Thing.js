var React = require("react");
var Croppie = require("../lib/Croppie.react");

var Thing = React.createClass({
	getInitialState(){
		return {
			url:"image.jpg",
			zoomer:true
		}
	},
	render(){
		return (
			<div>
				<Croppie  url={this.state.url} showZoomer={this.state.zoomer} ref="croppie"/>
				<div style={{textAlign:"center"}}>
					<div>
						<p>result image width and height(input zero for default size):</p>
						<div>
							width(px): <input className="input" type="number" defaultValue={0} ref="width"/><br/>
						</div>
						<div>
							height(px): <input className="input" type="number" defaultValue={0} ref="height"/><br/>
						</div>
						<span onClick={this.toggleZoomer} className="button">show/hide zoomer</span>
					</div>
					<span onClick={this.getResult.bind(this,"html")} className="button">html result</span>
					<span onClick={this.getResult.bind(this,"base64")} className="button">base64 result</span>
					<div style={{height:"20px"}}></div>
					<div>
						<div>result:</div>
						{this.resultView()}
					</div>
				</div>
			</div>
		)
	},
	getResult(type){
		var width = parseInt(this.refs.width.value),
			height = parseInt(this.refs.height.value);
		var size = {width,height};
		if(width ===0 || height === 0 )
			size = 'original';
		this.refs.croppie.result({size,type,circle:false}).then((res)=>{
			this.setState({
				result : res,
				resultType:type
			});
		});
	},
	resultView(){
		switch (this.state.resultType){
			case "html":
				return this.state.result;
			case "base64":
				return <img src={this.state.result} alt=""/>;
		}
	},
	toggleZoomer(){
		this.setState({
			zoomer : !this.state.zoomer
		});
	}

});

module.exports= Thing;