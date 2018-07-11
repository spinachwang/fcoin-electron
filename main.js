const {app, BrowserWindow, webContents} = require('electron');
const os = require("os");
let mainWindow;

// let currentApp = app.makeSingleInstance(() => {
//   if(mainWindow) {
//     if(mainWindow.isMinimized()) mainWindow.restore();
//     mainWindow.focus();
//   }
//   return true;
// });

// if(currentApp) {
//   app.quit();
// };

function createWindow () {
  mainWindow = new BrowserWindow({width: 1200, height: 1000})
  mainWindow.loadFile('index.html')
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  
  console.log(`node version is ${process.version}`);
  BrowserWindow.addDevToolsExtension("/Users/Bob/Library/Application Support/Google/Chrome/Default/Extensions/pkedcjkdefgpdelpbcmbmeomcjbeemfm/5917.424.0.7_0");
  mainWindow.webContents.openDevTools();
  console.log(os.cpus());
  //mainWindow.webContents.send("")
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
})


const ipcMain =require('electron').ipcMain;
ipcMain.on("message", (e, arg) => {
  console.log(arg);
  //e.sender.send("reply", "recived");
});