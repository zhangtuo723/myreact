let syncQueue: ((...args: any) => void)[] | null = null;
let isFlushingSyncQueue = false
export function scheduleSyncCallback(callback: (...args: any) => void) {
    if (syncQueue === null) {
        syncQueue = [callback]
    } else {
        syncQueue.push(callback)
    }
    
}

export function flushSyncCallbacks() {
    
    if (!isFlushingSyncQueue && syncQueue) {
       
        isFlushingSyncQueue = true

        try {
            // 同步执行完成后才会执行这里，
            // 感觉这个队列执行完成后要清空吧，每一轮都会重新执行一遍
            syncQueue.forEach(callback => callback())
            
            // while(syncQueue.length>0){
            // const callback:any = syncQueue.pop()
            // callback()
            // }
        } catch (e) {
            if (__DEV__) {
                console.error('flushSyncCallbacks报错', e)
            }
        } finally {
            isFlushingSyncQueue = false
            syncQueue = null
        }
    }
}

