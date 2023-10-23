import { beginWorker } from "./beginWorke";
import { completeWork } from "./completeWorke";
import { FiberNode } from "./fiber";
let workInprogress:FiberNode|null = null;

// 初始化
function prepareRefreshStack(fiber:FiberNode){
    workInprogress = fiber
}

function renderRoot(root:FiberNode){

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