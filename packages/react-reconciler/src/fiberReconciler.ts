import { Container } from "hostConfig";
import { FiberNode, FiberRootNode } from "./fiber";
import { HostRoot } from "./workTags";
import { UpdateQueue, createUpdate, createUpdateQueue, enqueueUpdate } from "./updateQueue";
import { ReactElementType } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";
import { requestUpdateLane } from "./fiberLanes";

export function createContainer(container: Container) {
    const hostRootFiber = new FiberNode(HostRoot, {}, null)
    const root = new FiberRootNode(container, hostRootFiber)

    hostRootFiber.updateQueue = createUpdateQueue()
    return root
}

export function updateContainer(element: ReactElementType | null, root: FiberRootNode) {
    console.log('render 调用了',element);
    
    const hostRootFiber = root.current;
    const lane = requestUpdateLane()
    const update = createUpdate<ReactElementType | null>(element, lane)
    console.log('创建update',update);
    
    enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, update)
    scheduleUpdateOnFiber(hostRootFiber, lane)
    return element
}