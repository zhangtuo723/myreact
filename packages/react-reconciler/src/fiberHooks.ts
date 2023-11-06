
import { FiberNode } from "./fiber";
import internals from "shared/internals";
import { Dispatch, Dispatcher } from 'react/src/currentDispatcher'
import { UpdateQueue, createUpdate, createUpdateQueue, enqueueUpdate } from "./updateQueue";
import { Action } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";

let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null

const { currentDispatcher } = internals
interface Hook {
    // fiber的memoizedState指向hook链表 这里的memoizedState是链表节点中存的数据
    memoizedState: any
    updateQueuq: unknown
    next: Hook | null
}

export function renderWithHooks(wip: FiberNode) {
    // 赋值操作
    currentlyRenderingFiber = wip
    wip.memoizedState = null

    const current = wip.alternate
    if (current !== null) {
        // update
    } else {
        // mount
        currentDispatcher.current = HooksDispatcherOnMount;
    }

    const Component = wip.type;
    const props = wip.pendingProps;
    const children = Component(props)

    //重置操作
    currentlyRenderingFiber = null
    return children
}


const HooksDispatcherOnMount: Dispatcher = {
    useState: mountState
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
    hook.updateQueuq = queue
    hook.memoizedState = memoizedState
    // @ts-ignore
    const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);

    return [memoizedState, dispatch]
}

function dispatchSetState<State>(
    fiber: FiberNode,
    updateQueue: UpdateQueue<State>,
    action: Action<State>
) {
    const update = createUpdate(action)
    enqueueUpdate(updateQueue, update)
    scheduleUpdateOnFiber(fiber)


}

function mountWorkInProgressHook(): Hook {
    const hook: Hook = {
        memoizedState: null,
        updateQueuq: null,
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