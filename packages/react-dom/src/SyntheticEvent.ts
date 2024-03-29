// 合成事件相关

import { Container } from "./hostConfig"
import { Props } from "shared/ReactTypes"
import { Instance } from "./hostConfig"


export const elementPropsKey = '__props'

const validEventTypeList = ['click']

type EventCallback = (e: Event) => void
interface SyntheticEvent extends Event {
    __stopPropagation: boolean;
}
interface Pahts {
    capture: EventCallback[]
    bubble: EventCallback[]
}


export interface DOMElement extends Element {
    [elementPropsKey]: Props
}
// dom[xxx] = reactElement props
export function updateFiberProps(node: DOMElement, props: Props) {
    node[elementPropsKey] = props
}

export function initEvent(container: Container|Instance, eventType: string) {
    if (!validEventTypeList.includes(eventType)) {
        console.warn('当前不支持', eventType, '事件')
        return
    }
    if (__DEV__) {
        console.log('初始化事件', eventType)
    }
    container.addEventListener(eventType, e => {
        dispatchEvent(container, eventType, e)
    })
}

function createSyntheticEvent(e: Event) {
    const SyntheticEvent = e as SyntheticEvent
    SyntheticEvent.__stopPropagation = false
    const originStopPropagation = e.stopPropagation

    SyntheticEvent.stopPropagation = () => {
        SyntheticEvent.__stopPropagation = true
        if (originStopPropagation) {
            //  ？？
            originStopPropagation()
        }
    }
    return SyntheticEvent
}

function dispatchEvent(container: Container, eventType: string, e: Event) {
    const targetElement = e.target
    if (targetElement === null) {
        console.warn('事件不存在target', e)
        return
    }
    // 1.收集沿途的事件
    const { bubble, capture } = collectPaths(targetElement as DOMElement, container, eventType)
    // 2. 构造合成事件
    const se = createSyntheticEvent(e)
    // 3. 遍历captue
    tariggerEventFlow(capture, se)
    if (!se.__stopPropagation) {
        // 4. 遍历bubble
        tariggerEventFlow(bubble,se)
    }


}

function tariggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
    for (let i = 0; i < paths.length; i++) {
        const callback = paths[i]
        callback.call(null, se)
        if (se.__stopPropagation) {
            break
        }
    }
}

function getEventCallbackNameFromEventType(eventType: string): string[] | undefined {

    return {
        click: ['onClickCapture', 'onClick']
    }[eventType]
}

function collectPaths(targetElement: DOMElement, container: Container, eventType: string) {
    const paths: Pahts = {
        capture: [],
        bubble: []
    }

    while (targetElement && targetElement !== container) {
        // 收集
        const elementProps = targetElement[elementPropsKey]
        if (elementProps) {
            // click -> onClick onClickCapture
            const callbackNameList = getEventCallbackNameFromEventType(eventType)
            if (callbackNameList) {
                callbackNameList.forEach((callbackName, i) => {
                    const eventCallback = elementProps[callbackName]
                    if (eventCallback) {
                        if (i === 0) {
                            paths.capture.unshift(eventCallback)
                        } else {
                            paths.bubble.push(eventCallback)
                        }
                    }
                })
            }
        }
        targetElement = targetElement.parentNode as DOMElement
    }

    return paths
}
