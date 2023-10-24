import { beginWorker } from "./beginWorke";
import { completeWork } from "./completeWorke";
import { FiberNode, FiberRootNode, createWorkInProgress } from "./fiber";
import { HostRoot } from "./workTags";
let workInprogress:FiberNode|null = null;

// 初始化
function prepareRefreshStack(root:FiberRootNode){
    workInprogress = createWorkInProgress(root.current,{})
}
export function scheduleUpdateOnFiber(fiber:FiberNode){
    // TODO 调度功能
    const root = markUpdateFromFibeToRoot(fiber)
    renderRoot(root)
    
}
function markUpdateFromFibeToRoot(fiber:FiberNode){
    let node = fiber
    let parent = fiber.return
    while(parent!=null){
        node = parent
        parent = node.return
    }
    if(node.tag == HostRoot){
        return node.stateNode;
    }
    return null;
}

function renderRoot(root:FiberRootNode){

    prepareRefreshStack(root)

    do{
        try {
            workLoop()
            break
        } catch (error) {
            console.warn('workLoop 发生错误')
            workInprogress = null
        }

    }while(true)

}

function workLoop(){
    while(workInprogress!==null){
        performanceUnitOfWork(workInprogress)
    }
}

function performanceUnitOfWork(fiber:FiberNode){
    const next = beginWorker(fiber)
    fiber.memoizedProps = fiber.pendingProps

    if(next==null){
        completeUnitofWork(fiber)
    }else{
        workInprogress = next
    }
}

function completeUnitofWork(fiber:FiberNode){
    let node:FiberNode|null = fiber
    do{
        completeWork(node)
        const sibling = node.sibling
        if(sibling!==null){
            workInprogress = sibling
            return
        }
        node = node.return
        workInprogress = node

    }while(node!==null)
}