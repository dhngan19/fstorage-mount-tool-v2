/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, Tray, Menu, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
// import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import EventsHandler from './events';




log.transports.file.resolvePath = (variables) => {
  if (variables.electronDefaultDir && variables.fileName) {
    return path.join(variables.electronDefaultDir, variables.fileName);
  }
  return path.join(path.join(__dirname, "logs"), "main.log");
}

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// Object.defineProperty(app, 'isPackaged', {
//   get() {
//     return true;
//   }
// });

let mainWindow: BrowserWindow | null = null;
let splash: BrowserWindow | null = null;

// ipcMain.on('ipc-example', async (event, arg) => {
//   const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
//   console.log(msgTemplate(arg));
//   event.reply('ipc-example', msgTemplate('pong'));
// });

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS'];

//   return installer
//     .default(
//       extensions.map((name) => installer[name]),
//       forceDownload
//     )
//     .catch(console.log);
// };
const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const hasSwitchHide = () => {
  return app.commandLine.hasSwitch("hide");
}

const createSplash = async () => {
  splash = new BrowserWindow({
    show: false,
    width: 510,
    height: 320,
    transparent: false,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      devTools: false,
    }
  });

  splash.loadURL(resolveHtmlPath('splash.html'))
  splash.center();

  splash.on('ready-to-show', () => {
    if (!splash) {
      throw new Error('"splash" is not defined');
    }

    if (!hasSwitchHide()) {
      splash.show();
    }
  });
}

const createWindow = async () => {
  if (isDebug) {
    console.log('is debug');
    // await installExtensions();
  }



  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 1024,
    minHeight: 728,
    center: true,
    // useContentSize: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      // devTools: false,
      nodeIntegration: false,
      // nodeIntegrationInWorker: true,
      contextIsolation: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  // mainWindow.maximize();
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(resolveHtmlPath('index.html'));
  mainWindow.center();

  // mainWindow.on('ready-to-show', () => {
  //   if (!mainWindow) {
  //     throw new Error('"mainWindow" is not defined');
  //   }
  //   if (process.env.START_MINIMIZED) {
  //     mainWindow.minimize();
  //   } else {
  //     mainWindow.show();
  //   }
  // });

  // app.on('ready', () => {
  //   createWindow();
  //   autoUpdater.checkForUpdatesAndNotify().then((r: any) => {
  //       console.log(`checkForUpdatesAndNotify : ${r}`)
  //   }).catch((err: any) => {
  //       console.log(err)
  //   });
  // });

  mainWindow.on('close', (_evt) => {
    _evt.preventDefault();
    mainWindow?.hide();
  })

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
*/

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});
// Auto update feature
// autoUpdater.requestHeaders = {"PRIVATE-TOKEN": "y4HU5b-sC16KsAsxssk2"};
// autoUpdater.autoDownload = true;

// autoUpdater.on('update-downloaded', () => {
//   console.log("Leaving and restarting")
// })

autoUpdater.on('checking-for-update', () => {
  log.info('Cheking for update...');
})

autoUpdater.on('update-available', () => {
  log.info('Update available');
})

autoUpdater.on('update-not-available', () => {
  log.info('Update not available');
})

autoUpdater.on('error', (err) => {
  log.info(`Error in auto-update. ${  err}`);
})

autoUpdater.on('update-downloaded', (info) => {
  log.info(`update-downloaded`);
})

autoUpdater.on('download-progress', (progressTrack) => {
  log.info('download-progress')
  log.info(progressTrack);
})

ipcMain.on('log', (e, [type, data]) => {
  log[type as 'info' | 'error'](data);
})

ipcMain.on('exit-app', () => {
  if (process.platform !== "darwin") {
      app.quit();
  }
});

ipcMain.on("minimize-app", () => {
  BrowserWindow?.getFocusedWindow()?.minimize();
});

ipcMain.on("restart-app", () => {
    app.relaunch();
    app.exit();
});


const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    // Print out data received from the second instance.
    if (additionalData) {
      console.log(additionalData)
    }

    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus()
    }
  });

  // app.setPath ('userData', path.resolve("%appdata%", "fstorage-mount-tool"));
  app.disableHardwareAcceleration();

  let tray = null;
  app
    .whenReady()
    .then(() => {

      const trayIcon = getAssetPath('icon.ico');
      const nativeTrayIcon = nativeImage.createFromPath(trayIcon);
      tray = new Tray(
        nativeTrayIcon
      );

      autoUpdater.checkForUpdatesAndNotify();

      const trayContextMenu = Menu.buildFromTemplate([
        {
          id: 'tray-contextmenu-restore-window',
          label: "Khôi phục cửa sổ ứng dụng",
          click: () => {
            mainWindow?.show();
          }
        },
        {
          id: 'tray-contextmenu-quit',
          label: "Đóng ứng dụng",
          click: () => {
            mainWindow?.destroy();
            app.quit();
          }
        }
      ]);

      tray.setToolTip('Mở ứng dụng');
      tray.setContextMenu(trayContextMenu);

      tray.on('click', () => {
        mainWindow?.show();
      })

      // const { openAtLogin } = app.getLoginItemSettings();

      if (!isDebug) {
        createSplash();
      }
      createWindow();

      if (!hasSwitchHide()) {
        setTimeout(() => {
          if (!isDebug) {
            splash!.close();
          }
          mainWindow!.show();
        }, isDebug ? 0 : 3000);
      }

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
          if (!isDebug) {
            createSplash();
          }
          createWindow();

          if (!hasSwitchHide()) {
            setTimeout(() => {
              if (!isDebug) {
                splash!.close();
              }
              mainWindow!.show();
            }, isDebug ? 0 : 3000);
          }
        }
      });
    })
    .then(() => {
      if (mainWindow) {
        EventsHandler(app, ipcMain, mainWindow);
      }
    })
    .catch(console.log);
}
