var React = require("react");
var ReactDOM = require("react-dom");


var Thing = require("./Thing");

var div = document.createElement("div");

document.body.appendChild(div);

ReactDOM.render(<Thing/>,div);