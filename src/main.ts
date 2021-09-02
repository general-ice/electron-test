import {app, BrowserWindow, Tray, ipcMain} from 'electron'
import path from 'path'

const ASSETS_PATH = path.join(__dirname, 'assets/')
const MAIN_WIN_PATH = path.join(__dirname, 'wins/main')

export enum Mode {
    one,
    two
}

// Couldn't find another one-type suitable images
const v1Icon = path.join(ASSETS_PATH, 'eggs.png')
const v2Icon = path.join(ASSETS_PATH, 'milk.png')

const modeIconMap: Record<Mode, string> = {
    [Mode.one]: v1Icon,
    [Mode.two]: v2Icon
}

const DEFAULT_MODE: Mode = Mode.one

let mode: Mode = DEFAULT_MODE
let tray: Tray

// Initialize Tray
app.whenReady()
    .then(_ => tray = new Tray(modeIconMap[DEFAULT_MODE]))

const changeTrayIcon = (iconPath: string) => app.whenReady()
    .then(_ => tray.setImage(iconPath))

// Bind main process message handler
ipcMain
    .on('change-mode', (event) => {
        const newMode = mode === Mode.one ? Mode.two : Mode.one
        changeTrayIcon(modeIconMap[newMode])
            .then(_ => mode = newMode)
            // If we change icon success, send confirmation reply
            .then(_ => event.reply('change-mode:reply', true))
    })

app
    .on("ready", () => {

        const mainWinHtmlPath = path.resolve(MAIN_WIN_PATH, './index.html')
        const mainWinScriptPath = path.resolve(MAIN_WIN_PATH, './index.js')

        const win = new BrowserWindow({width: 600, height: 400, webPreferences: {preload: mainWinScriptPath}})

        win
            .loadFile(mainWinHtmlPath)
            .then(_ => console.log('Main window was loaded'))
    })
