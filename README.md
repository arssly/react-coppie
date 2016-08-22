# react-coppie
an image cropping plugin based on [Croppie](http://foliotek.github.io/Croppie)
keep in mind this is a work in progress and not all the features of croppie are yet available
##install 

Npm:``` npm install react-croppie```

##using react-croppie

###in your react component:
```
  var Croppie = require("react-croppie");
  ...
  render(){
    return <Croppie url="path/to/image"/>
  }
  ```
###in your html file :
```
<link rel="stylesheet" href="node_modules/react-croppie/cropper.css">
```

##documentation
  
  you can pass props to react-croppie component based on [croppie docs](http://foliotek.github.io/Croppie/#documentation)
  
###the result
  currently we only support canvas type from [croppie docs](http://foliotek.github.io/Croppie/#documentation)
  
  ```
  var Croppie = require("react-croppie");
  ...
  render(){
   return <Croppie url="path/to/image" ref="reactCroppie"/>
  },
  ...
  getResult(options){
    this.refs.reactCroppie.result(options).then( res =>{
      //do whatever you like with the result
    });
  }
  ```
    
