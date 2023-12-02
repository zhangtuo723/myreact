import { Container } from "hostConfig";
import { FiberNode, FiberRootNode } from "./src/fiber";
import { HostRoot } from "./src/workTags";
import { UpdateQueue, createUpdate, createUpdateQueue, enqueueUpdate } from "./src/updateQueue";
import { ReactElementType } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./src/workLoop";
import { requestUpdateLane } from "./src/fiberLanes";

export function createContainer(container: Container) {
    const hostRootFiber = new FiberNode(HostRoot, {}, null)
    const root = new FiberRootNode(container, hostRootFiber)

    hostRootFiber.updateQueue = createUpdateQueue()
    return root
}

export function upDateContainer(element: ReactElementType | null, root: FiberRootNode) {
    const hostRootFiber = root.current;
    const lane = requestUpdateLane()
    const update = createUpdate<ReactElementType | null>(element,lane)
    enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType|null>,update)
    scheduleUpdateOnFiber(hostRootFiber,lane)
    return element
}