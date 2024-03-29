import { ReactElementType } from "shared/ReactTypes";
import { FiberNode } from "./fiber"
import { UpdateQueue, processUpdateQueue } from "./updateQueue";
import { FunctionComponent, HostComponent, HostRoot, HostText, Fragment } from "./workTags"
import { mountChildFibers, reconcileChildFibers } from "./childFibers";
import { renderWithHooks } from "./fiberHooks";
import { Lane } from "./fiberLanes";

export const beginWorker = (wip: FiberNode,renderLane:Lane) => {
    switch (wip.tag) {
        case HostRoot:
            return updateHostRoot(wip,renderLane)

        case HostComponent:
            return updateHostComponent(wip)
        case HostText:
            return null
        case FunctionComponent:
            return updateFunctionComponent(wip,renderLane)
        case Fragment:
            return updateFragment(wip)
        default:
            if (__DEV__) {
                console.log('beginWork未实现的类型');
            }
            break
    }
    return null
}
function updateFragment(wip: FiberNode) {
    const nextChildren = wip.pendingProps


    reconcileChildren(wip, nextChildren)

    return wip.child
}
function updateFunctionComponent(wip: FiberNode,renderLane:Lane) {
    const nextProps = wip.pendingProps
    const nextChildren = renderWithHooks(wip,renderLane)


    reconcileChildren(wip, nextChildren)

    return wip.child

}

function updateHostRoot(wip: FiberNode,renderLane:Lane) {
    const baseState = wip.memoizedState;
    const updateQueue = wip.updateQueue as UpdateQueue<Element>
    const pending = updateQueue.shared.pending
    updateQueue.shared.pending = null
    const { memoizedState } = processUpdateQueue(baseState, pending,renderLane)
    wip.memoizedState = memoizedState

    const nextChildren = wip.memoizedState
    reconcileChildren(wip, nextChildren)
    return wip.child;

}

function updateHostComponent(wip: FiberNode) {
    const nextProps = wip.pendingProps
    const nextChildren = nextProps.children
    reconcileChildren(wip, nextChildren)

    return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
    const current = wip.alternate
    if (current !== null) {
        // update
        wip.child = reconcileChildFibers(wip, current.child, children)
    } else {

        wip.child = mountChildFibers(wip, null, children)
    }

}