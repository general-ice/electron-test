import {ipcRenderer} from "electron";

enum BtnTextVariant {
    one = 'milk',
    two = 'eggs'
}

const DEFAULT_MODE: BtnTextVariant = BtnTextVariant.one

let mode: BtnTextVariant = DEFAULT_MODE

const requestToMainScript = () => {
    // Finish by answer
    // We wait a confirmation reply from main script
    const byAnswer = new Promise((res, rej) =>
        ipcRenderer.once('change-mode:reply', (event, isSuccess: boolean) => isSuccess ? res(null) : rej())
    )
    // Finish by fallback timeout
    const byFallback = new Promise((_, rej) => setTimeout(rej, 1000))

    // The message
    ipcRenderer.send('change-mode')

    // If we will not receive an answer, we go out from function with reject state by fallback timeout
    return Promise.race([byAnswer, byFallback])
}

window.addEventListener('DOMContentLoaded', _ => {
    const btn = document.getElementById('mode-switcher') as HTMLButtonElement

    console.log('HELLO', btn);

    const setBtnText = (txt: string) => btn.innerText = `to ${txt}`

    const changeMode = (isOne: boolean) => {
            mode = isOne ? BtnTextVariant.two : BtnTextVariant.one
            setBtnText(mode)
        }

    // Initialize btn text according default value
    ;(function initialize() {
        setBtnText(mode)
    }())

    const handleBtnClick = () => {
        // Try to change "mode" in main process.
        // If it's success, change the internal mode and btn text
        requestToMainScript()
            .then(_ => changeMode(mode === BtnTextVariant.one))
    }

    btn
        .addEventListener('click', handleBtnClick)

})