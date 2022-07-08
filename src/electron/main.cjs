const url = require("url");
const {app, BrowserWindow} = require("electron");

(() => {

    const createWindow = async () => {
        const window = new BrowserWindow({
            height: 500,
            width: 500,
            minHeight: 500,
            minWidth: 500,
            show: false
        });
        const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: `file://${__dirname}/../build/index.html`,
            protocol: 'file:',
            slashes: true,
        });
        await window.loadURL(startUrl);
        window.on('ready-to-show', window.show);
    }
    setTimeout(() => app.whenReady().then(createWindow), 4000);
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });

})();
