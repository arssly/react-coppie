const React 	= require("react");
const ReactDOM 	= require("react-dom");

const Transform = require("./Transform");
const StyleRelated = require("./styleStuff");

///////////
var TransformOrigin = function (el) {
	if (!el || !el.style[StyleRelated.CSS_TRANS_ORG]) {
		this.x = 0;
		this.y = 0;
		return;
	}
	var css = el.style[StyleRelated.CSS_TRANS_ORG].split(' ');
	this.x = parseFloat(css[0]);
	this.y = parseFloat(css[1]);
};

TransformOrigin.prototype.toString = function () {
	return this.x + 'px ' + this.y + 'px';
};
//////////




var Croppie = React.createClass({
	//////////
	isDragging:false,
	originalX : null,
	originalY : null,
	originalDistance : null,
	vpRect :null,
	transform : null,
	_currentZoom :1,

	data:{},//TODO
	//////////////
	PropTypes: {
		viewport 			: React.PropTypes.object,//TODO objectOf
		boundary 			: React.PropTypes.object,//TODO objectOf
		orientationControls : React.PropTypes.object,//TODO objectOf
		customClass 		: React.PropTypes.string,
		showZoomer 			: React.PropTypes.bool,
		enableZoom 			: React.PropTypes.bool,
		mouseWheelZoom 		: React.PropTypes.bool,
		enableExif 			: React.PropTypes.bool,
		enforceBoundary 	: React.PropTypes.bool,
		enableOrientation 	: React.PropTypes.bool,
		update 				: React.PropTypes.func,
		url 				: React.PropTypes.string
	},
	getInitialState(){
		return {};
	},
	componentDidMount(){
		this._bind(this.props.url);
	},
	componentWillReceiveProps(nextProps){
		if(nextProps.url !== this.props.url)
			this._bind(nextProps.url);
	},
	getDefaultProps(){
		return {
			viewport: {
				width: 100,
				height: 100,
				type: 'circle'
			},
			boundary: {
				width: 300,
				height: 300
			},
			orientationControls: {
				enabled: true,
				leftClass: '',
				rightClass: ''
			},
			customClass: '',
			showZoomer: true,
			enableZoom: true,
			mouseWheelZoom: true,
			enableExif: false,
			enforceBoundary: true,
			enableOrientation: false,
			update:()=> { }
		}
	},
	render(){
		var self = this,
			contClass = 'croppie-container',
			customViewportClass = this.props.viewport.type ? 'cr-vp-' + this.props.viewport.type : " ",
			preview;
		if(self.props.enableOrientation)
			preview = <canvas  className="cr-image" ref="preview" style={this.state.previewStyle ||  {}}> </canvas>;
		else
			preview = <img src="" className="cr-image" ref="preview" style={this.state.previewStyle ||  {}}/>;

		var onWheelFunc = this.props.enableZoom ? this.onWheel : () =>{};
		return (
			<div className={contClass}>
				<div className="cr-boundary"
					 ref="boundary"
					 style={{width :this.props.boundary.width,height:this.props.boundary.height}}
					 onWheel = {onWheelFunc}
				>
					{preview}

					<div tabIndex="0"
						 onKeyDown={this.keyDown}
						 ref="viewport"
						 className={"cr-viewport " + customViewportClass }
						 style={{width :this.props.viewport.width,height:this.props.viewport.height}}
					></div>

					<div className = "cr-overlay"
						 onTouchStart = {this.mouseDown}
						 onMouseDown = {this.mouseDown}
						 style = {this.state.overlayStyle}
					></div>

				</div>
				{this.props.enableZoom &&
					<div className="cr-slider-wrap">
						<input type="range"
							   className="cr-slider"
							   step="0.0001"
							   style={{display:this.props.showZoomer ? "": "none"}}
							   onChange={this.changeZoom}
							   ref="zoomer"
						/>
					</div>
				}
			</div>
		);
	},
	onWheel(ev){
		var self =this;
		var delta, targetZoom;

		if (ev.wheelDelta) {
			delta = ev.wheelDelta / 1200; //wheelDelta min: -120 max: 120 // max x 10 x 2
		} else if (ev.deltaY) {
			delta = ev.deltaY / 1060; //deltaY min: -53 max: 53 // max x 10 x 2
		} else if (ev.detail) {
			delta = ev.detail / -60; //delta min: -3 max: 3 // max x 10 x 2
		} else {
			delta = 0;
		}
		targetZoom = self._currentZoom + delta;

		ev.preventDefault();
		this._setZoomerVal(targetZoom);
		this.changeZoom();
	},
	 mouseDown(ev) {
		ev.preventDefault();
		if (this.isDragging) return;

		this.isDragging = true;
		this.originalX = ev.pageX;
		this.originalY = ev.pageY;
		if (ev.touches) {
			var touches = ev.touches[0];
			this.originalX = touches.pageX;
			this.originalY = touches.pageY;
		}

		this.transform = Transform.parse(this.refs.preview);
		window.addEventListener('mousemove', this.mouseMove);
		window.addEventListener('touchmove', this.mouseMove);
		window.addEventListener('mouseup', this.mouseUp);
		window.addEventListener('touchend', this.mouseUp);

		document.body.style[StyleRelated.CSS_USERSELECT] = 'none';
		this.vpRect = this.refs.viewport.getBoundingClientRect();
	},
	 keyDown(ev) {
		 var self =this;
		var LEFT_ARROW  = 37,
			UP_ARROW    = 38,
			RIGHT_ARROW = 39,
			DOWN_ARROW  = 40;

		if (ev.shiftKey && (ev.keyCode == UP_ARROW || ev.keyCode == DOWN_ARROW)) {
			var zoom = 0.0;
			if (ev.keyCode == UP_ARROW) {
				zoom = parseFloat(self.refs.zoomer.value, 10) + parseFloat(self.refs.zoomer.step, 10)
			}
			else {
				zoom = parseFloat(self.refs.zoomer.value, 10) - parseFloat(self.refs.zoomer.step, 10)
			}
			// self.setZoom(zoom);
			self._setZoomerVal(zoom);
		}
		else if (ev.keyCode >= 37 && ev.keyCode <= 40) {
			ev.preventDefault();
			var movement = parseKeyDown(ev.keyCode);

			self.transform = Transform.parse(self.refs.preview);
			document.body.style[StyleRelated.CSS_USERSELECT] = 'none';
			self.vpRect = self.refs.viewport.getBoundingClientRect();
			self.keyMove(movement);
		}

		function parseKeyDown(key) {
			switch (key) {
				case LEFT_ARROW:
					return [1, 0];
				case UP_ARROW:
					return [0, 1];
				case RIGHT_ARROW:
					return [-1, 0];
				case DOWN_ARROW:
					return [0, -1];
			}
		}
	},
	 keyMove(movement) {
		var deltaX = movement[0],
			deltaY = movement[1],
			newCss = {};

		this.assignTransformCoordinates(deltaX, deltaY);

		newCss[StyleRelated.CSS_TRANSFORM] = this.transform.toString();
		// css(self.elements.preview, newCss);
		 this.setState({
			previewStyle : newCss
		 });
		this._updateOverlay();
		document.body.style[StyleRelated.CSS_USERSELECT] = '';
		this._updateCenterPoint();
		// _triggerUpdate.call(self);TODO
		this.originalDistance = 0;
	},
	mouseMove(ev){

		ev.preventDefault();
		var pageX = ev.pageX,
			pageY = ev.pageY;

		if (ev.touches) {
			var touches = ev.touches[0];
			pageX = touches.pageX;
			pageY = touches.pageY;
		}

		var deltaX = pageX - this.originalX,
			deltaY = pageY - this.originalY,
			newCss = {};
		if (ev.type == 'touchmove') {
			if (ev.touches.length > 1) {
				var touch1 = ev.touches[0];
				var touch2 = ev.touches[1];
				var dist = Math.sqrt((touch1.pageX - touch2.pageX) * (touch1.pageX - touch2.pageX) + (touch1.pageY - touch2.pageY) * (touch1.pageY - touch2.pageY));

				if (!this.originalDistance) {
					this.originalDistance = dist / self._currentZoom;
				}

				var scale = dist / this.originalDistance;

				this._setZoomerVal.call(self, scale);
				//dispatchChange(self.elements.zoomer);TODO
				return;
			}
		}

		this.assignTransformCoordinates(deltaX, deltaY);
		newCss[StyleRelated.CSS_TRANSFORM] = this.transform.toString();
		//css(self.elements.preview, newCss);

		this.setState({
			previewStyle : cssExtend(newCss,this.state.previewStyle)
		});


		setTimeout(this._updateOverlay,0);
		this.originalY = pageY;
		this.originalX = pageX;
	},
	changeZoom(){
		var self = this;
		this._onZoom({
			value: parseFloat(this.refs.zoomer.value),
			origin: new TransformOrigin(self.refs.preview),
			viewportRect: self.refs.viewport.getBoundingClientRect(),
			transform: Transform.parse(self.refs.preview)
		});
	},
	mouseUp(){
		this.isDragging = false;
		window.removeEventListener('mousemove', this.mouseMove);
		window.removeEventListener('touchmove', this.mouseMove);
		window.removeEventListener('mouseup', this.mouseUp);
		window.removeEventListener('touchend', this.mouseUp);
		document.body.style[StyleRelated.CSS_USERSELECT] = '';
		this._updateCenterPoint();
		// this._triggerUpdate.call(self);TODO
		this.originalDistance = 0;
	},
	 _updateOverlay() {
		var boundRect = this.refs.boundary.getBoundingClientRect(),
			imgData = this.refs.preview.getBoundingClientRect();

		 this.setState({
			 overlayStyle : {
				 width: imgData.width + 'px',
				 height: imgData.height + 'px',
				 top: (imgData.top - boundRect.top) + 'px',
				 left: (imgData.left - boundRect.left) + 'px'
			 }
		 });


	 },
	 _setZoomerVal(v) {//TODO
		if (this.props.enableZoom) {
			var z = ReactDOM.findDOMNode(this.refs.zoomer),
				val = this.fix(v, 4);
			z.value = Math.max(z.min, Math.min(z.max, val));
		}
	},
	 _onZoom(ui) {
		var self 		= this,
			transform 	= ui ? ui.transform : Transform.parse(ReactDOM.findDOMNode(this.refs.preview)),
			vpRect 		= ui ? ui.viewportRect : self.refs.elements.viewport.getBoundingClientRect(),//TODO does this need this.vpRect
			origin 		= ui ? ui.origin : new TransformOrigin(ReactDOM.findDOMNode(this.refs.preview)),
			transCss 	= {};

		function applyCss() {
			var transCss = {};
			transCss[StyleRelated.CSS_TRANSFORM] = transform.toString();
			transCss[StyleRelated.CSS_TRANS_ORG] = origin.toString();
			self.setState({
				previewStyle : transCss
			});
		}

		self._currentZoom = ui ? ui.value : self._currentZoom;
		transform.scale = self._currentZoom;
		applyCss();


		if (this.props.enforceBoundary) {
			var boundaries = this._getVirtualBoundaries(vpRect),
				transBoundaries = boundaries.translate,
				oBoundaries = boundaries.origin;

			if (transform.x >= transBoundaries.maxX) {
				origin.x = oBoundaries.minX;
				transform.x = transBoundaries.maxX;
			}

			if (transform.x <= transBoundaries.minX) {
				origin.x = oBoundaries.maxX;
				transform.x = transBoundaries.minX;
			}

			if (transform.y >= transBoundaries.maxY) {
				origin.y = oBoundaries.minY;
				transform.y = transBoundaries.maxY;
			}

			if (transform.y <= transBoundaries.minY) {
				origin.y = oBoundaries.maxY;
				transform.y = transBoundaries.minY;
			}
		}
		applyCss();
		 setTimeout(this._updateOverlay,0);

		//_triggerUpdate.call(self); TODO
	},
	 _getVirtualBoundaries(viewport) {//TODO
		var self = this,
			scale = self._currentZoom,
			vpWidth = viewport.width,
			vpHeight = viewport.height,
			centerFromBoundaryX = self.props.boundary.width / 2,
			centerFromBoundaryY = self.props.boundary.height / 2,
			imgRect = self.refs.preview.getBoundingClientRect(),
			curImgWidth = imgRect.width,
			curImgHeight = imgRect.height,
			halfWidth = vpWidth / 2,
			halfHeight = vpHeight / 2;

		var maxX = ((halfWidth / scale) - centerFromBoundaryX) * -1;
		var minX = maxX - ((curImgWidth * (1 / scale)) - (vpWidth * (1 / scale)));

		var maxY = ((halfHeight / scale) - centerFromBoundaryY) * -1;
		var minY = maxY - ((curImgHeight * (1 / scale)) - (vpHeight * (1 / scale)));

		var originMinX = (1 / scale) * halfWidth;
		var originMaxX = (curImgWidth * (1 / scale)) - originMinX;

		var originMinY = (1 / scale) * halfHeight;
		var originMaxY = (curImgHeight * (1 / scale)) - originMinY;

		return {
			translate: {
				maxX: maxX,
				minX: minX,
				maxY: maxY,
				minY: minY
			},
			origin: {
				maxX: originMaxX,
				minX: originMinX,
				maxY: originMaxY,
				minY: originMinY
			}
		};
	},
	 fix(v, decimalPoints) {
		return parseFloat(v).toFixed(decimalPoints || 0);
	},
	 _bind(options) {
		var self = this,
			url,
			points = [],
			zoom = null;

		if (typeof (options) === 'string') {
			url = options;
			options = {};
		}
		else if (Array.isArray(options)) {
			points = options.slice();
		}
		else if (typeof (options) == 'undefined' && self.data.url) { //refreshing TODO
			this._updatePropertiesFromImage.call(self);
			// _triggerUpdate.call(self);TODO
			return null;
		}
		else {
			url = options.url;
			points = options.points || [];
			zoom = typeof(options.zoom) === 'undefined' ? null : options.zoom;
		}

		self.data.bound = false;
		self.data.url = url || self.data.url;
		self.data.points = (points || self.data.points).map(function (p) {
			return parseFloat(p);
		});
		self.data.boundZoom = zoom;
		var prom = this.loadImage(url, self.refs.preview);
		prom.then(function () {
			self._updatePropertiesFromImage.call(self);
			// _triggerUpdate.call(self);TODO
		});
		return prom;
	},
	 loadImage(src, imageEl) {
		var self = this;
		var img = imageEl || new Image(),
			prom;

		if (img.src === src) {
			// If image source hasn't changed, return a promise that resolves immediately
			prom = new Promise(function (resolve, reject) {
				resolve(img);
			});
		} else {
			prom = new Promise(function (resolve, reject) {
				if (self.props.enableOrientation && src.substring(0,4).toLowerCase() === 'http') {
					img.setAttribute('crossOrigin', 'anonymous');
				}
				img.onload = function () {
					setTimeout(function () {
						resolve(img);
					}, 1);
				};
			});

			img.src = src;
		}

		return prom;
	},
	 _updatePropertiesFromImage() {
		var self = this,
			minZoom = 0,
			maxZoom = 1.5,
			initialZoom = 1,
			cssReset = {},
			img = self.refs.preview,
			zoomer = self.refs.zoomer,
			transformReset = new Transform(0, 0, initialZoom),
			originReset = new TransformOrigin(),
			isVisible = this._isVisible(self),
			imgData,
			vpData,
			boundaryData,
			minW,
			minH;

		if (!isVisible || self.data.bound) {
			// if the croppie isn't visible or it doesn't need binding
			console.warn("WHAAAAAAAAAAAAAAAAAAAAAAAAAAAT");
			return;
		}

		self.data.bound = true;
		cssReset[StyleRelated.CSS_TRANSFORM] = transformReset.toString();
		cssReset[StyleRelated.CSS_TRANS_ORG] = originReset.toString();
		cssReset['opacity'] = 1;
		 this.setState({
			 previewStyle : cssReset
		 });

		imgData = img.getBoundingClientRect();
		vpData = self.refs.viewport.getBoundingClientRect();
		boundaryData = self.refs.boundary.getBoundingClientRect();
		self._originalImageWidth = imgData.width;
		self._originalImageHeight = imgData.height;

		if (self.props.enableZoom) {
			if (self.props.enforceBoundary) {
				minW = vpData.width / imgData.width;
				minH = vpData.height / imgData.height;
				minZoom = Math.max(minW, minH);
			}

			if (minZoom >= maxZoom) {
				maxZoom = minZoom + 1;
			}

			zoomer.min = this.fix(minZoom, 4);
			zoomer.max = this.fix(maxZoom, 4);
			var defaultInitialZoom = Math.max((boundaryData.width / imgData.width), (boundaryData.height / imgData.height));
			initialZoom = self.data.boundZoom !== null ? self.data.boundZoom : defaultInitialZoom;
			this._setZoomerVal(initialZoom);
			this._currentZoom = initialZoom;
			//dispatchChange(zoomer);TODO
		}
		else {
			self._currentZoom = initialZoom;
		}

		transformReset.scale = self._currentZoom;
		cssReset[StyleRelated.CSS_TRANSFORM] = transformReset.toString();
		 this.setState({
			 previewStyle : cssReset
		 });

		if (self.data.points.length) {
			console.warn("damn _bindPoints is called");
			//_bindPoints.call(self, self.data.points);
		}
		else {
			this._centerImage.call(self);
		}

		this._updateCenterPoint.call(self);
		this._updateOverlay.call(self);
	},
	 _isVisible() {//TODO
		return this.refs.preview.offsetHeight > 0 && this.refs.preview.offsetWidth > 0;
	},
	 _centerImage() {
		var self = this,
			imgDim = self.refs.preview.getBoundingClientRect(),
			vpDim = self.refs.viewport.getBoundingClientRect(),
			boundDim = self.refs.boundary.getBoundingClientRect(),
			vpLeft = vpDim.left - boundDim.left,
			vpTop = vpDim.top - boundDim.top,
			w = vpLeft - ((imgDim.width - vpDim.width) / 2),
			h = vpTop - ((imgDim.height - vpDim.height) / 2),
			transform = new Transform(w, h, self._currentZoom);
	
		//css(self.elements.preview, CSS_TRANSFORM, transform.toString());
		 var previewStyle = {};
		 previewStyle[StyleRelated.CSS_TRANSFORM] = transform.toString();
		 this.setState({
			 previewStyle : previewStyle
		 });
	},
	 _updateCenterPoint() {
		var self = this,
			scale = self._currentZoom,
			data = self.refs.preview.getBoundingClientRect(),
			vpData = self.refs.viewport.getBoundingClientRect(),
			transform = Transform.parse(self.refs.preview.style[StyleRelated.CSS_TRANSFORM]),
			pc = new TransformOrigin(self.refs.preview),
			top = (vpData.top - data.top) + (vpData.height / 2),
			left = (vpData.left - data.left) + (vpData.width / 2),
			center = {},
			adj = {};

		center.y = top / scale;
		center.x = left / scale;
		adj.y = (center.y - pc.y) * (1 - scale);
		adj.x = (center.x - pc.x) * (1 - scale);

		transform.x -= adj.x;
		transform.y -= adj.y;

		var newCss = {};
		newCss[StyleRelated.CSS_TRANS_ORG] = center.x + 'px ' + center.y + 'px';
		newCss[StyleRelated.CSS_TRANSFORM] = transform.toString();
		//css(self.elements.preview, newCss);
		 this.setState({
			 previewStyle : newCss
		 });
	},
	 assignTransformCoordinates(deltaX, deltaY) {
		 var self = this;
		var imgRect = self.refs.preview.getBoundingClientRect(),
			top = this.transform.y + deltaY,
			left = this.transform.x + deltaX;

		if (self.props.enforceBoundary) {
			if (this.vpRect.top > imgRect.top + deltaY && this.vpRect.bottom < imgRect.bottom + deltaY) {
				this.transform.y = top;
			}

			if (this.vpRect.left > imgRect.left + deltaX && this.vpRect.right < imgRect.right + deltaX) {
				this.transform.x = left;
			}
		}
		else {
			this.transform.y = top;
			this.transform.x = left;
		}
	 },
	RESULT_DEFAULTS : {
	type: 'canvas',
	format: 'png',
	quality: 1
	},
	RESULT_FORMATS : ['jpeg', 'webp', 'png'],
	 result(options) {
		var self = this,
			data = this._get(),
			opts = deepExtend(deepExtend({},this.RESULT_DEFAULTS), deepExtend({}, options)),
			type = (typeof (options) === 'string' ? options : (opts.type || 'viewport')),
			size = opts.size,
			format = opts.format,
			quality = opts.quality,
			backgroundColor = opts.backgroundColor,
			circle =  typeof opts.circle === 'boolean' ? opts.circle : (self.props.viewport.type === 'circle'),
			vpRect = self.refs.viewport.getBoundingClientRect(),
			ratio = vpRect.width / vpRect.height,
			prom;
			console.log("results defaults are", this.RESULT_DEFAULTS);
		if (size === 'viewport') {
			data.outputWidth = vpRect.width;
			data.outputHeight = vpRect.height;
		} else if (typeof size === 'object') {
			if (size.width && size.height) {
				data.outputWidth = size.width;
				data.outputHeight = size.height;
			} else if (size.width) {
				data.outputWidth = size.width;
				data.outputHeight = size.width / ratio;
			} else if (size.height) {
				data.outputWidth = size.height * ratio;
				data.outputHeight = size.height;
			}
		}

		if (this.RESULT_FORMATS.indexOf(format) > -1) {
			data.format = 'image/' + format;
			data.quality = quality;
		}

		data.circle = circle;
		data.url = self.data.url;
		data.backgroundColor = backgroundColor;

		prom = new Promise(function (resolve, reject) {
			if(type === 'rawCanvas'){
				resolve(self._getCanvasResult(self.refs.preview,data));
			}
			if (type === 'canvas' || type == 'base64') {
				resolve(self._getBase64Result(data));
			}
			else if(type ==='blob') {
				resolve(self._getBlobResult(data));
			}
			else
				resolve(self._getHtmlResult(data));
		});
		return prom;
	},
	_getHtmlResult(data){
		var points = data.points;
		return (
			<div className="croppie-result" style={{width:points[2] - points[0],height:points[3] - points[1]}}>
				<img src={data.url} style={{left:(-1 * points[0]) + 'px',top: (-1 * points[1]) + 'px'}}/>
			</div>
		);
	},
	_getBase64Result(data){
		var self = this;
		return self._getCanvasResult(self.refs.preview,data).toDataURL(data.format, data.quality);
	},
	_getBlobResult(data) {
		var self = this;
		return new Promise(function (resolve, reject) {
			let canvasRes = self._getCanvasResult(self.refs.preview,data);
			canvasRes.toBlob(function (blob) {
				resolve(blob);
			}, data.format, data.quality);
		});
	},

	 _get() {//TODO
		var self = this,
			imgData = self.refs.preview.getBoundingClientRect(),
			vpData = self.refs.viewport.getBoundingClientRect(),
			x1 = vpData.left - imgData.left,
			y1 = vpData.top - imgData.top,
			widthDiff = (vpData.width - self.refs.viewport.offsetWidth) / 2,
			heightDiff = (vpData.height - self.refs.viewport.offsetHeight) / 2,
			x2 = x1 + self.refs.viewport.offsetWidth + widthDiff,
			y2 = y1 + self.refs.viewport.offsetHeight + heightDiff,
			scale = self._currentZoom;

		if (scale === Infinity || isNaN(scale)) {
			scale = 1;
		}

		var max = self.props.enforceBoundary ? 0 : Number.NEGATIVE_INFINITY;
		x1 = Math.max(max, x1 / scale);
		y1 = Math.max(max, y1 / scale);
		x2 = Math.max(max, x2 / scale);
		y2 = Math.max(max, y2 / scale);

		return {
			points: [this.fix(x1), this.fix(y1), this.fix(x2), this.fix(y2)],
			zoom: scale
		};
	},
	_getCanvasResult(img, data) {
		var points = data.points,
			left = points[0],
			top = points[1],
			width = (points[2] - points[0]),
			height = (points[3] - points[1]),
			circle = data.circle,
			canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			outWidth = width,
			outHeight = height;

		if (data.outputWidth && data.outputHeight) {
			outWidth = data.outputWidth;
			outHeight = data.outputHeight;
		}

		canvas.width = outWidth;
		canvas.height = outHeight;

		if (data.backgroundColor) {
			ctx.fillStyle = data.backgroundColor;
			ctx.fillRect(0, 0, outWidth, outHeight);
		}
		ctx.drawImage(img, left, top, width, height, 0, 0, outWidth, outHeight);
		if (circle) {
			ctx.fillStyle = '#fff';
			ctx.globalCompositeOperation = 'destination-in';
			ctx.beginPath();
			ctx.arc(outWidth / 2, outHeight / 2, outWidth / 2, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
		}
		return canvas;
	}
});

module.exports = Croppie;

function deepExtend(destination, source) {
	destination = destination || {};
	for (var property in source) {
		if(!source.hasOwnProperty(property))
			continue;
		if (source[property] && source[property].constructor && source[property].constructor === Object) {
			if (destination[property] && destination[property].constructor && destination[property].constructor === Object)
				deepExtend(destination[property], source[property]);
			else{
				destination[property] ={};
				deepExtend(destination[property], source[property]);
			}
		} else {
			destination[property] = source[property];
		}
	}
	return destination;
}


function cssExtend(source,old){
	for(var key in old){
		if(! old.hasOwnProperty(key))
			continue;
		if(!source[key])
			source[key] = old[key];
	}
	return  source;
}
//TODO

