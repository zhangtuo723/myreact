// React 
import { Dispatcher, resolveDispatcher } from "./src/currentDispatcher"
import { jsxDEV } from "./src/jsx"
import currentDispatcher from './src/currentDispatcher'

export const useState: Dispatcher['useState'] = (initalState) => {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initalState)
}

// 这变量名真他妈搞笑
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
    currentDispatcher
}
export default {
    version: '0.0.0',
    createElement: jsxDEV
}