
import { FiberNode } from "./fiber";
import internals from "shared/internals";
import { Dispatch, Dispatcher } from 'react/src/currentDispatcher'
import { UpdateQueue, createUpdate, createUpdateQueue, enqueueUpdate, processUpdateQueue } from "./updateQueue";
import { Action } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";
import { Lane, NoLane, requestUpdateLane } from "./fiberLanes";

let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null
let currentHook: Hook | null = null
let renderLane:Lane = NoLane

const { currentDispatcher } = internals
interface Hook {
    // fiber的memoizedState指向hook链表 这里的memoizedState是链表节点中存的数据
    memoizedState: any
    updateQueue: unknown
    next: Hook | null
}

export function renderWithHooks(wip: FiberNode,lane:Lane) {
    // 赋值操作
    currentlyRenderingFiber = wip
    // fiber的memoizedState 指向第一个hooks
    wip.memoizedState = null
    renderLane = lane
    const current = wip.alternate

    if (current !== null) {
        // update

        currentDispatcher.current = HooksDispatcherOnUpdate;
    } else {
        // mount
        currentDispatcher.current = HooksDispatcherOnMount;
    }

    const Component = wip.type;
    const props = wip.pendingProps;
    const children = Component(props)

    //重置操作
    currentlyRenderingFiber = null
    workInProgressHook = null
    currentHook = null
    renderLane = NoLane
    return children
}


const HooksDispatcherOnMount: Dispatcher = {
    useState: mountState
}

const HooksDispatcherOnUpdate: Dispatcher = {
    useState: updateState
}
function updateState<State>(): [State, Dispatch<State>] {
    // 找到当前useState对应的hook数据
    const hook = updateWorkInProgressHook()


    // 计算新state的逻辑
    const queue = hook.updateQueue as UpdateQueue<State>

    const pending = queue.shared.pending

    if (pending !== null) {
        const { memoizedState } = processUpdateQueue(hook.memoizedState, pending,renderLane)
        hook.memoizedState = memoizedState
    }

    return [hook.memoizedState, queue.dispatch as Dispatch<State>]
}

function updateWorkInProgressHook(): Hook {
    // TODO render 出发的更新
    let nextCurrentHook: Hook | null
    
    if (currentHook === null) {
        
        // 这是fc update 时的第一个hook
        const current = currentlyRenderingFiber?.alternate
        if (current !== null) {
            nextCurrentHook = current?.memoizedState
        } else {
            nextCurrentHook = null
        }
    } else {
        // 这个fc update 时后续的hook
        nextCurrentHook = currentHook.next
    }

    if (nextCurrentHook === null) {
        // mount/update u1 u2 u3 
        // update u1 u2 u3 u4
        throw new Error(`组件${currentlyRenderingFiber?.type}本次执行的hook比上次多`)
    }

    currentHook = nextCurrentHook as Hook

    const newHook: Hook = {
        memoizedState: currentHook.memoizedState,
        updateQueue: currentHook.updateQueue,
        next: null
    }



    if (workInProgressHook === null) {
        // mount时 第一个hook
        if (currentlyRenderingFiber === null) {
            throw new Error('请在函数组件内调用hook')
        } else {
            workInProgressHook = newHook
            currentlyRenderingFiber.memoizedState = workInProgressHook
        }
    } else {
        // mount时 后续的hook
        workInProgressHook.next = newHook
        workInProgressHook = newHook
    }

    return workInProgressHook

}

function mountState<State>(initialState: (() => State) | State): [State, Dispatch<State>] {
    // 找到当前useState对应的hook数据
    const hook = mountWorkInProgressHook()


    let memoizedState;
    if (initialState instanceof Function) {
        memoizedState = initialState()
    } else {
        memoizedState = initialState
    }
    const queue = createUpdateQueue<State>();
    hook.updateQueue = queue
    hook.memoizedState = memoizedState
    // @ts-ignore
    const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
    queue.dispatch = dispatch
    return [memoizedState, dispatch]
}

function dispatchSetState<State>(
    fiber: FiberNode,
    updateQueue: UpdateQueue<State>,
    action: Action<State>
) {
    const lane = requestUpdateLane()
    const update = createUpdate(action,lane)
    enqueueUpdate(updateQueue, update)
    scheduleUpdateOnFiber(fiber,lane)


}

function mountWorkInProgressHook(): Hook {
    const hook: Hook = {
        memoizedState: null,
        updateQueue: null,
        next: null
    }
    if (workInProgressHook === null) {
        // mount时 第一个hook
        if (currentlyRenderingFiber === null) {
            throw new Error('请在函数组件内调用hook')
        } else {
            workInProgressHook = hook
            currentlyRenderingFiber.memoizedState = workInProgressHook
        }
    } else {
        // mount时 后续的hook
        workInProgressHook.next = hook
        workInProgressHook = hook
    }
    return workInProgressHook
}