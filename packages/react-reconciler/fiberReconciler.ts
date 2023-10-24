import { Container } from "hostConfig";
import { FiberNode, FiberRootNode } from "./src/fiber";
import { HostRoot } from "./src/workTags";
import { UpdateQueue, createUpdate, createUpdateQueue, enqueueUpdate } from "./src/updateQueue";
import { ReactElementType } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./src/workLoop";

export function createContainer(container: Container) {
    const hostRootFiber = new FiberNode(HostRoot, {}, null)
    const root = new FiberRootNode(container, hostRootFiber)

    hostRootFiber.updateQueue = createUpdateQueue()
    return root
}

export function upDateContainer(element: ReactElementType | null, root: FiberRootNode) {
    const hostRootFiber = root.current;

    const update = createUpdate<ReactElementType | null>(element)
    enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType|null>,update)
    scheduleUpdateOnFiber(hostRootFiber)
    return element
}