const path = require("path");
const url = require("url");
const {app, BrowserWindow} = require("electron");

(() => {

    const createWindow = async showValue => {
        const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '../index.html'),
            protocol: 'file:',
            slashes: true,
        });
        const window = new BrowserWindow({width: 500, height: 500, minHeight: 500, minWidth: 500, show: showValue});
        await window.loadURL(startUrl);
    }

    app.whenReady().then(() => createWindow(true));
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });

})();
