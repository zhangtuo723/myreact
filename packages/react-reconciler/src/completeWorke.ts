import { Container, appendInitialChild, createInstance, createTextInstance } from "hostConfig"
import { FiberNode } from "./fiber"
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./workTags"
import { NoFlags } from "./fiberFlags"
export const completeWork = (wip: FiberNode) => {

    const newProps = wip.pendingProps
    const current = wip.alternate

    switch (wip.tag) {
        case HostComponent:
            // 构建dom 插入 dom树中
            if (current !== null && wip.stateNode) {
                // update
            } else {
                // 挂载
                // 构建dom 
                // const instance = createInstance(wip.type，newProps)
                const instance = createInstance(wip.type)
                // 插入dom树中
                appendAllChildren(instance, wip)
                wip.stateNode = instance

            }
            bubbleProperties(wip)
            return null
        case HostText:
            if (current !== null && wip.stateNode) {
                // update
            } else {
                // 挂载
                // 构建dom 
                const instance = createTextInstance(newProps.content)
                // 插入到dom
                wip.stateNode = instance

            }
            bubbleProperties(wip)
            return null
        case HostRoot:
            bubbleProperties(wip)
            return null
        case FunctionComponent:
            bubbleProperties(wip)
            return null
        default:
            if (__DEV__) {
                console.warn('未处理的completeWork', wip)
            }
            break
    }

}

function appendAllChildren(parent: Container, wip: FiberNode) {
    let node = wip.child;
    while (node !== null) {
        if (node.tag === HostComponent || node.tag === HostText) {
            // 首屏幕complete时候会将dom插入到父亲dom上，并且打上placement标签,commit 时候会重新执行副作用，这时候会重新插入一遍的？？？？
            appendInitialChild(parent, node?.stateNode)
        } else if (node.child !== null) {
            node.child.return = node;
            node = node.child;
            continue
        }
        if (node === wip) {
            return
        }

        while (node.sibling == null) {
            if (node.return == null || node.return === wip) {
                return
            }
            node = node?.return
        }
        node.sibling.return = node.return
        node = node.sibling
    }

}

function bubbleProperties(wip:FiberNode){
    let subtreeFlags = NoFlags
    let child = wip.child;
    while (child!==null){
        subtreeFlags|=child.subtreeFlags
        subtreeFlags|=child.flags
        child.return = wip
        child = child.sibling
    }
    wip.subtreeFlags|=subtreeFlags
}