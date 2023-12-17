import { Container, Instance, appendInitialChild, createInstance, createTextInstance } from "hostConfig"
import { FiberNode } from "./fiber"
import { Fragment, FunctionComponent, HostComponent, HostRoot, HostText } from "./workTags"
import { NoFlags, Update } from "./fiberFlags"



function markUpdate(fiber: FiberNode) {
    fiber.flags |= Update
}
export const completeWork = (wip: FiberNode) => {

    const newProps = wip.pendingProps
    const current = wip.alternate

    switch (wip.tag) {
        case HostComponent:
            // 构建dom 插入 dom树中
            if (current !== null && wip.stateNode) {
                // todo update
                // 1. props 是否变化
                // 2. 变了 Update flag 
                // 正常情况下要判断所有的props 是否改变，有点麻烦不影响功能，性能影响也不大，暂时不处理

                // FiberNode.updateQueue = [className,'aaa']
                // 标记有update
                markUpdate(wip)
                // ？？？ updateFiberProps(wip.stateNode, newProps)
            } else {
                // 挂载
                // 构建dom 
                // const instance = createInstance(wip.type，newProps)
                const instance = createInstance(wip.type, newProps)
                // 插入dom树中
                appendAllChildren(instance, wip)
                wip.stateNode = instance

            }
            bubbleProperties(wip)
            return null
        case HostText:
            if (current !== null && wip.stateNode) {
                // update  // memoizedProps Props | null   props 是any？啊
                const oldText = current.memoizedProps.content;
                const newText = newProps.content;
                if (oldText !== newText) {
                    markUpdate(wip)
                }
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
        case FunctionComponent:
        case Fragment:
            bubbleProperties(wip)
            return null
        default:
            if (__DEV__) {
                console.warn('未处理的completeWork', wip)
            }
            break
    }

}

function appendAllChildren(parent: Container|Instance, wip: FiberNode) {
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

function bubbleProperties(wip: FiberNode) {
    let subtreeFlags = NoFlags
    let child = wip.child;
    while (child !== null) {
        subtreeFlags |= child.subtreeFlags
        subtreeFlags |= child.flags
        child.return = wip
        child = child.sibling
    }
    wip.subtreeFlags |= subtreeFlags
}