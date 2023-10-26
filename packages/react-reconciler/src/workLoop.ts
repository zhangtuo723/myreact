import { beginWorker } from "./beginWorke";
import { commitMutationEffects } from "./commitWork";
import { completeWork } from "./completeWorke";
import { FiberNode, FiberRootNode, createWorkInProgress } from "./fiber";
import { MutationMask, NoFlags } from "./fiberFlags";
import { HostRoot } from "./workTags";
let workInprogress: FiberNode | null = null;

// 初始化
function prepareRefreshStack(root: FiberRootNode) {
    workInprogress = createWorkInProgress(root.current, {})
}
export function scheduleUpdateOnFiber(fiber: FiberNode) {
    // TODO 调度功能
    const root = markUpdateFromFibeToRoot(fiber)
    renderRoot(root)

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

function renderRoot(root: FiberRootNode) {

    prepareRefreshStack(root)

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
    // 重置
    root.finishedWork = null
    // 判断是否存在3个子阶段需要执行的操作
    //  root flags root subreeFlags

    const subtreeHasEffect = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
    if (subtreeHasEffect || rootHasEffect) {
        // beforeMutation
        // mutation Placement

        commitMutationEffects(finishedWork)

        root.current = finishedWork
        // layout

    } else {
        root.current = finishedWork  // 切换fiber树
    }

}

function workLoop() {
    while (workInprogress !== null) {
        performanceUnitOfWork(workInprogress)
    }
}

function performanceUnitOfWork(fiber: FiberNode) {
    const next = beginWorker(fiber)
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