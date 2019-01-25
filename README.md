# react-coppie
An image cropping plugin based on [Croppie](http://foliotek.github.io/Croppie)
keep in mind this is a work in progress and not all the features of croppie are yet available
##install 

Npm:``` npm install react-croppie```

## Using react-croppie

### In your react component:
```
  var Croppie = require("react-croppie");
  ...
  render(){
    return <Croppie url="path/to/image"/>
  }
  ```
### In your html file :
```
<link rel="stylesheet" href="node_modules/react-croppie/cropper.css">
```

## Documentation
  
  You can pass props to react-croppie component based on [croppie docs](http://foliotek.github.io/Croppie/#documentation)
  
### The result
  Currently we only support canvas type from [croppie docs](http://foliotek.github.io/Croppie/#documentation)
  
  ```
  var Croppie = require("react-croppie");
  ...
  render() {
   return <Croppie url="path/to/image" ref="reactCroppie"/>
  },
  ...
  getResult(options){
    this.refs.reactCroppie.result(options).then( res =>{
      //do whatever you like with the result
    });
  }
  ```
    
