const isDev = require("electron-is-dev");
const url = require("url");
const path = require("path");
const {app, BrowserWindow} = require("electron");

(() => {

    const createWindow = async () => {
        const window = new BrowserWindow({
            height: 500,
            width: 500,
            minHeight: 500,
            minWidth: 500,
            show: true
        });
        const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: `file://${__dirname}/../build/index.html`,
            protocol: 'file:',
            slashes: true,
        });
        isDev ? await window.loadURL(startUrl) : await window.loadFile(path.join("build", "index.html"));
    }
    setTimeout(() => app.whenReady().then(createWindow), 8000);
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });

})();
