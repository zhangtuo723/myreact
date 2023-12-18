import { Container, Instance, appendChildToContainer, commitUpdate, insertChildToContainer, removeChild } from "hostConfig";
import { FiberNode, FiberRootNode, PendingPassiveEffects } from "./fiber";
import { ChildDeletion, Flags, MutationMask, NoFlags, PassiveEffect, PassiveMask, Placement, Update } from "./fiberFlags";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./workTags";
import { Effect, FCupDateQueue } from "./fiberHooks";
import { HookHasEffect } from "./hookEffectTags";

let nextEffect: FiberNode | null = null
export const commitMutationEffects = (finishedWork: FiberNode, root: FiberRootNode) => {

    nextEffect = finishedWork

    while (nextEffect !== null) {
        // 向下遍历
        const child: FiberNode | null = nextEffect.child
        if (
            (nextEffect.subtreeFlags & (MutationMask | PassiveMask)) !== NoFlags &&
            child !== null
        ) {
            nextEffect = child
        } else {
            // 向上遍历dfs
            up: while (nextEffect !== null) {
                commitMutationEffectsOnFiber(nextEffect, root)
                const sibling: FiberNode | null = nextEffect.sibling
                if (sibling !== null) {
                    nextEffect = sibling
                    break up;
                }
                nextEffect = nextEffect.return
            }
        }
    }


}


const commitMutationEffectsOnFiber = (finishedWork: FiberNode, root: FiberRootNode) => {
    const flags = finishedWork.flags;
    if ((flags & Placement) !== NoFlags) {
        commitPlacement(finishedWork)
        finishedWork.flags &= ~Placement
    }
    // flags Update
    if ((flags & Update) !== NoFlags) {
        commitUpdate(finishedWork)
        finishedWork.flags &= ~Update
    }
    // flgs ChildDeletion
    if ((flags & ChildDeletion) !== NoFlags) {
        const deletions = finishedWork.deletions
        
        if (deletions !== null) {
            deletions.forEach(childToDelete => {
                
                
                commitDeletion(childToDelete, root)
            })
        }
        finishedWork.flags &= ~ChildDeletion
        
    }
    if ((flags & PassiveEffect) !== NoFlags) {
        // 收集回调
       console.log('更新收集');
        commitPassiveEffect(finishedWork, root, 'update')
        finishedWork.flags &= ~PassiveEffect // 收集后移除

    }
}
function commitPassiveEffect(fiber: FiberNode, root: FiberRootNode, type: keyof PendingPassiveEffects) {
    // update unmount 
    if (
        fiber.tag !== FunctionComponent ||
        (type === 'update' && (fiber.flags & PassiveEffect) === NoFlags)
    ) {
        return
    }

    const updateQueue = fiber.updateQueue as FCupDateQueue<any>
    if (updateQueue !== null) {
        if (updateQueue.lastEffect === null && __DEV__) {
            console.error('当fc存在PassiveEffect flag时，不应该不存在effect')
        }
        
        console.log(updateQueue.lastEffect,'xxxxxxxxxxx');
        
        root.pendingPassiveEffects[type].push(updateQueue.lastEffect as Effect)
        console.log('xxxss');
        
    }
}

function commitHookEffectList(flags: Flags, lastEffect: Effect, callback: (effect: Effect) => void) {

    let effect = lastEffect.next as Effect

    do {
        if ((effect.tag & flags) === flags) {
            callback(effect)
        }
        effect = effect.next as Effect
    } while (effect != lastEffect.next)

}

export function commitHookEffectListUnmount(flags: Flags, lastEffect: Effect) {
    commitHookEffectList(flags, lastEffect, effect => {
        const destroy = effect.destroy
       
        console.log('组件卸载执行');
        
        if (typeof destroy === 'function') {
            destroy();
        }
        effect.tag &= ~HookHasEffect
    })

}

export function commitHookEffectListDestroy(flags: Flags, lastEffect: Effect) {
    commitHookEffectList(flags, lastEffect, effect => {
        const destroy = effect.destroy
        console.log('组件更新销毁执行',destroy);
        if (typeof destroy === 'function') {
            destroy();
        }

    })

}

export function commitHookEffectListCreate(flags: Flags, lastEffect: Effect) {

    commitHookEffectList(flags, lastEffect, effect => {
        const create = effect.create
        
        if (typeof create === 'function') {
            

            effect.destroy = create()
            
            
        }

    })

}



function recordHostChildrenToDelete(rootChildrenToDelete: FiberNode[], unmountFiber: FiberNode) {
    // 1 找到第一个root host节点
    let lastOne = rootChildrenToDelete[rootChildrenToDelete.length - 1]
    if (!lastOne) {
        rootChildrenToDelete.push(unmountFiber)
    } else {
        let node = lastOne.sibling
        while (node !== null) {
            if (unmountFiber === node) {
                rootChildrenToDelete.push(unmountFiber)
            }
            node = node.sibling
        }
    }
    // 2 每找到一个host 判断一下是不是1找到的那个兄弟 
}

function commitDeletion(childToDelete: FiberNode, root: FiberRootNode) {
    
    
    let rootChildrenToDelete: FiberNode[] = []
    
    
    // 递归子树
    commitNestedComponent(childToDelete, unmountFiber => {

        
        
    
        switch (unmountFiber.tag) {
            case HostComponent:
                
                recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber)
                // TODO 解绑ref
                return
            case HostText:
                recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber)
                return
            case FunctionComponent:
                // TODO 解绑ref
                console.log('卸载收集多一次收集');
                
                commitPassiveEffect(unmountFiber, root, 'unmount')
                return
            default:
                if (__DEV__) {
                    console.warn('未处理的unmount类型')
                }

        }
    })
    //移除rootHostComponent的DOM
    if (rootChildrenToDelete.length) {
        const hostParent = getHostParent(childToDelete)
        if (hostParent !== null) {
            rootChildrenToDelete.forEach(node => {
                removeChild(node.stateNode, hostParent)
            })

        }

    }
    childToDelete.return = null
    childToDelete.child = null
}
function commitNestedComponent(
    root: FiberNode,
    onCommitUnmount: (fiber: FiberNode) => void
) {
    let node = root
    while (true) {

        onCommitUnmount(node);
        if (node.child !== null) {
            // 向下遍历
            node.child.return = node; // 这行有用？ 默认不就是child的return 指向 node
            node = node.child
            continue
        }
        if (node === root) {
            // 终止
            return
        }
        while (node.sibling === null) {
            if (node.return === null || node.return === root) {
                return
            }
            // 向上遍历
            node = node.return
        }
        node.sibling.return = node.return
        node = node.sibling
    }
}

const commitPlacement = (finishedWork: FiberNode) => {
    // parent Dom
    // finishedWork ~~ DOM

    if (__DEV__) {
        console.warn('执行placement操作', finishedWork)
    }
    // parent DOM
    const hostParent = getHostParent(finishedWork)

    // host sibling
    const sibling = getHostSibling(finishedWork)

    // finishedwork---dom
    if (hostParent !== null) {
        insertOrAppendPlacementNodeIntoContainer(finishedWork, hostParent, sibling)
    }

}
function getHostSibling(fiber: FiberNode) {
    let node: FiberNode = fiber
    findSibling: while (true) {
        while (node.sibling === null) {
            const parent = node.return
            if (parent === null || parent.tag === HostComponent || parent.tag === HostRoot) {
                return null
            }
        }
        node.sibling.return = node.return
        node = node.sibling
        while (node.tag !== HostText && node.tag !== HostComponent) {
            // 向下遍历，找子孙节点
            if ((node.flags & Placement) !== NoFlags) {
                continue findSibling
            }
            if (node.child === null) {
                continue findSibling
            } else {
                node.child.return = node = node.child
            }

        }
        if ((node.flags & Placement) === NoFlags) {
            return node.stateNode
        }
    }

}
function getHostParent(fiber: FiberNode): Container | null {
    let parent = fiber.return
    while (parent) {
        const parentTag = parent.tag
        // hostComponent  HostRoot
        if (parentTag === HostComponent) {
            return parent.stateNode as Container
        }
        if (parentTag === HostRoot) {
            return (parent.stateNode as FiberRootNode).container
        }
        parent = parent.return

        if (__DEV__) {
            console.warn('未找到hostParent');

        }
    }

    return null

}

function insertOrAppendPlacementNodeIntoContainer(
    finishedWork: FiberNode,
    hostParent: Container,
    before?: Instance
) {
    // fiber host

    if (finishedWork.tag === HostComponent || finishedWork.tag == HostText) {
        if (before) {
            insertChildToContainer(finishedWork.stateNode, hostParent, before)
        } else {
            appendChildToContainer(hostParent, finishedWork.stateNode)
        }

        return
    }
    const child = finishedWork.child
    if (child !== null) {
        insertOrAppendPlacementNodeIntoContainer(child, hostParent)
        let sibling = child.sibling
        while (sibling !== null) {
            insertOrAppendPlacementNodeIntoContainer(sibling, hostParent)
            sibling = sibling.sibling
        }
    }
}