// only add update server if it's not being run from cli
if (require.main !== module) {
  require('update-electron-app')({
    logger: require('electron-log')
  })
}

const path = require('path')
const glob = require('glob')
const {app, BrowserWindow} = require('electron')

const debug = /--debug/.test(process.argv[2])

let websocketmode = false;

if (process.mas) app.setName('Electron APIs')

const ipcMain = require('electron').ipcMain;

let mainWindow = null

function initialize () {
  makeSingleInstance()

  loadDemos()

  function createWindow () {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.getName()
    }

    // if (process.platform === 'linux') {
    //   windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
    // }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(path.join('file://', __dirname, '/pages/mainWindow.html'))

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', () => {
      createWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  });
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Require each JS file in the main-process dir
function loadDemos () {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })
}

initialize();


ipcMain.on("document-ready", function(evt, msg){
    mainWindow.webContents.send("cl", "APP is ready");

    console.log(process.argv);
    for(let arg of process.argv)
        if(arg === "websocketmode=on")
            websocketmode = true;

    if(websocketmode){
        mainWindow.webContents.send("cl", "websocketmode=" + websocketmode);

        let WebSocketServer = require('ws').Server;
        let wss = new WebSocketServer({port: 6661});

        wss.on('connection', function (socket) {

            mainWindow.webContents.send("cl", "Client Socket Connected");
            socket.on('message', function (message, flags) {
                mainWindow.webContents.send("cl", "WS Message: " + message);
                if(message && typeof message === 'string'){
                    try{
                        obj = JSON.parse(message);
                        mainWindow.webContents.send(obj.act, obj.msg);
                    }catch (e){
                        mainWindow.webContents.send("cl", "WS Error: message is not a JSON");
                    }
                }



            });

            socket.on('close', function(err){
                console.log("closed");
                console.log(err);
            });

        });
        wss.on("close", function(err){console.log("closed");console.log(err);});
        wss.on("error", function(err){console.log("error");console.log(err);});

        wss.broadcast = function (data) {
            wss.clients.forEach(function (client) {
                client.send(data);
            });
        };
        setTimeout(function(){
            if(process.stdout){
                process.stdout.cork();
                process.stdout.write(JSON.stringify({act: "init", msg:6661}));
                process.stdout.uncork();
            }
        }, 500)

    }

});


process.on('message', (message) => {
    mainWindow.webContents.send("cl", "foi de uma vcez");
    // mainWindow.webContents.send("cl", message);
    // console.log("message in: " + message);
    // process.send("message in: " + message);
    // if(mainWindow)
    //     mainWindow.webContents.send('add-vis', message);
});

