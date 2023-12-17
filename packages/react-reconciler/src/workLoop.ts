import { scheduleMicroTask } from "hostConfig";
import { beginWorker } from "./beginWorke";
import { commitHookEffectListCreate, commitHookEffectListDestroy, commitHookEffectListUnmount, commitMutationEffects } from "./commitWork";
import { completeWork } from "./completeWorke";
import { FiberNode, FiberRootNode, PendingPassiveEffects, createWorkInProgress } from "./fiber";
import { MutationMask, NoFlags, PassiveMask } from "./fiberFlags";
import { Lane, NoLane, SyncLane, getHighestPrioritylane, markRootFinished, mergeLanes } from "./fiberLanes";
import { flushSyncCallbacks, scheduleSyncCallback } from "./syncTaskQueue";
import { HostRoot } from "./workTags";
import {
    unstable_scheduleCallback as scheduleCallback,
    unstable_NormalPriority as NormalPriority
} from 'scheduler'
import { HookHasEffect, Passive } from "./hookEffectTags";


let workInprogress: FiberNode | null = null;
let wipRootRenderLane: Lane = NoLane;
let rootDoesHasPassiveEffects = false
// 初始化
function prepareRefreshStack(root: FiberRootNode, lane: Lane) {
    workInprogress = createWorkInProgress(root.current, {})
    wipRootRenderLane = lane
}
export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
    const root = markUpdateFromFibeToRoot(fiber)
    markRootUpdated(root, lane)
    ensureRootIsScheduled(root)

}

// schedule 阶段入口
function ensureRootIsScheduled(root: FiberRootNode) {
    const updateLane = getHighestPrioritylane(root.pendingLanes)
    if (updateLane === NoLane) {
        return
    }
    if (updateLane === SyncLane) {
        // 同步优先级 微任务调度
        if (__DEV__) {
            console.log('在微任务中调度，优先级：', updateLane);

        }
        // [performSyncWorkOnRoot,performSyncWorkOnRoot] 如队的过程
        scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane))

        scheduleMicroTask(flushSyncCallbacks)
    } else {
        // 其他优先级 用宏任务调度
    }
}


function markRootUpdated(root: FiberRootNode, lane: Lane) {
    root.pendingLanes = mergeLanes(root.pendingLanes, lane)
}


// 网上冒找到第一个fiber，因为要从这里开始渲染
function markUpdateFromFibeToRoot(fiber: FiberNode) {
    let node = fiber
    let parent = fiber.return
    while (parent != null) {
        node = parent
        parent = node.return
    }
    if (node.tag == HostRoot) {
        return node.stateNode;
    }
    return null;
}


function performSyncWorkOnRoot(root: FiberRootNode, lane: Lane) {

    const nextLane = getHighestPrioritylane(root.pendingLanes)
    if (nextLane !== SyncLane) {
        // 其他SyncLane底的优先级
        // NoLane
        ensureRootIsScheduled(root)
        return
    }
    // 初始化
    prepareRefreshStack(root, lane)
    do {
        try {
            workLoop()
            break
        } catch (error) {

            if (__DEV__) {
                console.warn('workLoop 发生错误')
            }
            workInprogress = null
        }

    } while (true)


    const finishedWork = root.current.alternate
    root.finishedWork = finishedWork
    root.finishedLane = lane
    wipRootRenderLane = NoLane

    // wip fiberNode树 数中的flags
    commitRoot(root)


}

function commitRoot(root: FiberRootNode) {
    // 最后那个离屏fiber
    const finishedWork = root.finishedWork
    if (finishedWork == null) {
        return
    }

    if (__DEV__) {
        console.warn('commit阶段开始', finishedWork)
    }
    const lane = root.finishedLane
    if (lane === NoLane && __DEV__) {
        console.error('commit阶段finishedLane不应该是Nolan')
    }
    // 重置
    root.finishedWork = null
    root.finishedLane = NoLane
    // 清掉这个lane
    markRootFinished(root, lane)
    if (
        (finishedWork.flags & PassiveMask) !== NoFlags ||
        (finishedWork.subtreeFlags & PassiveMask) !== NoFlags
    ) {
        if (!rootDoesHasPassiveEffects) {
            rootDoesHasPassiveEffects = true
            // 调度副作用,使用官方提供的调度器，也就是调用一个回调函数，优先级是NormalPriority
            scheduleCallback(NormalPriority, () => {
                //执行副作用
                flushPassiveEffects(root.pendingPassiveEffects)
                return;
            })

        }

    }
    // 判断是否存在3个子阶段需要执行的操作
    //  root flags root subreeFlags

    const subtreeHasEffect = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
    if (subtreeHasEffect || rootHasEffect) {
        // beforeMutation
        // mutation Placement

        commitMutationEffects(finishedWork, root)

        root.current = finishedWork
        // layout

    } else {
        root.current = finishedWork  // 切换fiber树
    }

    rootDoesHasPassiveEffects = false
    ensureRootIsScheduled(root)

}

function flushPassiveEffects(pendingPassiveEffects: PendingPassiveEffects) {

    // 卸载的情况，也就是执行 useEffect 的return
    pendingPassiveEffects.unmount.forEach(effect => {
        // 这里是执行useEffect相关，执行layoutEffect的话就将passive修改过为layout相关的
        commitHookEffectListUnmount(Passive, effect)
    })

    pendingPassiveEffects.unmount = []

    
    pendingPassiveEffects.update.forEach(effect => {
        commitHookEffectListDestroy(Passive | HookHasEffect,effect)
    })

    pendingPassiveEffects.update.forEach(effect => {
        commitHookEffectListCreate(Passive | HookHasEffect,effect)
    })
    
    pendingPassiveEffects.update = []
    // effect 内部可能更新的操作，?????,所以重新flushSyncCallbacks
    flushSyncCallbacks()


}

function workLoop() {
    while (workInprogress !== null) {
        performanceUnitOfWork(workInprogress)
    }

}

function performanceUnitOfWork(fiber: FiberNode) {
    const next = beginWorker(fiber, wipRootRenderLane)
    fiber.memoizedProps = fiber.pendingProps
    if (next == null) {
        completeUnitofWork(fiber)
    } else {
        workInprogress = next
    }
}

function completeUnitofWork(fiber: FiberNode) {
    let node: FiberNode | null = fiber
    do {
        completeWork(node)

        const sibling = node.sibling
        if (sibling !== null) {
            workInprogress = sibling
            return
        }
        node = node.return
        workInprogress = node

    } while (node !== null)
}