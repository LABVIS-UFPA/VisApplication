const electron = require('electron');
const dialog = electron.dialog;

const path = require('path')
const glob = require('glob')

const {app, BrowserWindow} = require('electron')
const debug = /--debug/.test(process.argv[2])
let websocketmode = false;
let websocketport = 0;
if (process.mas) app.setName('Electron APIs')
const ipcMain = require('electron').ipcMain
let mainWindow = null

const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const fs = require('fs')
const csv = require('csvtojson')

// only add update server if it's not being run from cli
if (require.main !== module) {
    require('update-electron-app')({
        logger: require('electron-log')
    })
}

function initialize () {
    makeSingleInstance()

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

        ipcMain.on('not-data', (event, message) => {
            if(message){
                mainWindow.webContents.send('errror-data');
            }else{
                openFile();
            }
        });

        mainWindow = new BrowserWindow(windowOptions)
        mainWindow.loadURL(path.join('file://', __dirname, '/pages/mainWindow.html'))

        mainWindow.on('closed', () => {
            mainWindow = null
        })

        const menu = new Menu();

        const menuTemplateFile = {
            label: 'File',
            submenu: [
                {label: 'load',click (){
                        openFile();
                }
                }]
        };

        const menuTemplateDebug = {
            label: 'Debug',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click (item, focusedWindow) {
                        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                    }
                }
            ]
        };

        menu.append(new MenuItem(menuTemplateFile));
        menu.append(new MenuItem(menuTemplateDebug));
        mainWindow.setMenu(menu);

        //Work on Mac.
        if(process.platform === 'darwin'){
            mainWindow.on("focus", ()=>{
                const menuTemplate = [menuTemplateFile, menuTemplateVisualize, menuTemplateDebug];
                Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
            });
        }

        mainWindow.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null;
            // app.quit();
        });

    }

    app.on('ready', () => {
        createWindow()
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow()
        }
    })
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
//open and convert datafile
function openFile () {
    dialog.showOpenDialog(function (fileNames) {
        if (fileNames === undefined) return;
        let fileName = fileNames[0];

        csv()
            .fromFile(fileName)
            .then((jsonObj)=>{
                for(let i = 0; i < jsonObj.length; i++){
                    let obj = jsonObj[i];
                    for(let prop in obj){
                        if(obj.hasOwnProperty(prop) && obj[prop] !== null && !isNaN(obj[prop])){
                            obj[prop] = +obj[prop];
                        }
                    }
                }
                mainWindow.webContents.send("file-data", jsonObj)
            })
    });
}

// Require each JS file in the main-process dir
function loadDemos () {
    const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
    files.forEach((file) => { require(file) })
}

initialize()

ipcMain.on('document-ready', function (evt, msg) {
    mainWindow.webContents.send('cl', 'APP is ready')

    console.log(process.argv)
    for (let arg of process.argv) {
        if (arg === 'websocketmode=on') {
            websocketmode = true
        }else if (arg.startsWith('port=')) {
            websocketport = +arg.replace("port=","");
        }
    }

    if (websocketmode) {
        mainWindow.webContents.send('cl', 'websocketmode=' + websocketmode);

        const WebSocket = require('ws');
        const ws = new WebSocket(`ws://127.0.0.1:${websocketport}/`);


        ws.on('open', function(){
            mainWindow.webContents.send('cl', 'WS is open!');
            ws.send("oi");
        });
        ws.on('message', function (message, flags) {
            mainWindow.webContents.send('cl', 'WS Message: ' + message);
            if (message && typeof message === 'string') {
                try {
                    obj = JSON.parse(message);
                    mainWindow.webContents.send(obj.act, obj.msg)
                } catch (e) {
                    mainWindow.webContents.send('cl', 'WS Error: message is not a JSON')
                }
            }
        });
        ws.on('close', function (err) {
            mainWindow.webContents.send('cl', 'WS Closed.');
            console.log(err);
        });
    }
})

process.on('message', (message) => {
    mainWindow.webContents.send('cl', 'foi de uma vcez')
    // mainWindow.webContents.send("cl", message);
    // console.log("message in: " + message);
    // process.send("message in: " + message);
    // if(mainWindow)
    //     mainWindow.webContents.send('add-vis', message);
})

