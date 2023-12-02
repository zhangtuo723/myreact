import { Dispatch } from "react/src/currentDispatcher";
import { Action } from "shared/ReactTypes"
import { Lane } from "./fiberLanes";
export interface Update<State> {
    action: Action<State>
    next: Update<any> | null,
    lane: Lane
}

export interface UpdateQueue<State> {
    shared: {
        pending: Update<State> | null;
    }
    dispatch: Dispatch<State> | null
}

export const createUpdate = <State>(action: Action<State>, lane: Lane): Update<State> => {
    return {
        action,
        lane,
        next: null
    }
}


export const createUpdateQueue = <State>() => {
    return {
        shared: {
            pending: null
        },
        dispatch: null
    } as UpdateQueue<State>
}

export const enqueueUpdate = <State>(
    updateQueue: UpdateQueue<State>, update: Update<State>
) => {
    const pending = updateQueue.shared.pending
    if (pending === null) {
        update.next = update
    } else {
        update.next = pending.next
        pending.next = update
    }
    updateQueue.shared.pending = update
}

export const processUpdateQueue = <State>(
    baseState: State,
    pendingUpdate: Update<State> | null,
    renderLane: Lane
): { memoizedState: State } => {
    const result: ReturnType<typeof processUpdateQueue<State>> = { memoizedState: baseState }
    if (pendingUpdate !== null) {
        // pendingUpdate 指向环状链表的最后一个，next 就是第一个
        let first = pendingUpdate.next
        let pending = pendingUpdate.next as Update<any>
        do {

            const updateLane = pending.lane
            if (updateLane === renderLane) {
                const action = pending.action
                // setstate 里面传入的是函数
                if (action instanceof Function) {
                    baseState = action(baseState)
                } else {
                    baseState = action
                }
            }else{
                if(__DEV__){
                    console.error('不应该进入这个逻辑updateLane !== renderLane');
                }
            }
            pending = pending?.next as Update<any>
        } while (pending !== first)

    }
    result.memoizedState = baseState
    return result
}