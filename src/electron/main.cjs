const path = require("path");
const url = require("url");
const {app, BrowserWindow} = require("electron");

(() => {

    let mainWindow;

    const createWindow = () => {
        const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '../index.html'),
            protocol: 'file:',
            slashes: true,
        });
        mainWindow = new BrowserWindow({width: 500, height: 500, minHeight: 500, minWidth: 500});
        mainWindow.loadURL(startUrl);
        mainWindow.on('closed', () => {
            mainWindow = null;
        });

    }

    app.removeAllListeners('ready');
    app.on('ready', createWindow);
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
    app.on('activate', () => {
        if (mainWindow === null) createWindow();
    });
})();
