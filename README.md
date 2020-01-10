# VisApplication
Interactive information visualization tool with a set of standard techniques and scalable layout that can be used in [Blocks](https://github.com/gustavoresque/DataGenerator "Blocks") or individually.


## How to build
First of all, you have to install the [electron-packager](https://github.com/electron-userland/electron-packager) in globally way running the code below:
```
npm install -g electron-packager

npm i 

npm i @labvis-ufpa/vistechlib@1.0.13
```
You can run the application locally running the code below:
```
npm start
```
After that you can run the following codes:
### Windows
```
electron-packager . --overwrite --asar=true --platform=win32 --arch=ia32 --prune=true --out=release-builds --version-string.ProductName="DataGenerator"
```
### Linux
```
electron-packager . --overwrite --asar=true --platform=linux --arch=x64 --prune=true --out=release-builds --version-string.ProductName="DataGenerator"
```
### MacOS
```
electron-packager . --overwrite --platform=darwin --arch=x64 --prune=true --out=release-builds --version-string.ProductName="DataGenerator"
```

###  Documentation

[Api documentation](https://doxdox.org/LABVIS-UFPA/vistechlib "documentation")

## License

[Apache 2.0 (Public Domain)](LICENSE)
