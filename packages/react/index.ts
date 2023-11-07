// React 
import { Dispatcher, resolveDispatcher } from "./src/currentDispatcher"
import { jsxDEV,jsx,isValidElement as isValidElementFn } from "./src/jsx"
import currentDispatcher from './src/currentDispatcher'


export const useState: Dispatcher['useState'] = (initalState) => {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initalState)
}

// 这变量名真他妈搞笑
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
    currentDispatcher
}
export const version = '0.0.0.0'

//  TODO 根据环境使用jsx/jsxDEV
export const createElement = jsx

export const isValidElement = isValidElementFn
// export default {
//     version: '0.0.0',
//     createElement: jsxDEV
// }