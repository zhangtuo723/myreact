import { Props, Key, Ref } from "shared/ReactTypes";
import { WorkTag } from "./workTags";
import { Flags, NoFlags } from "./fiberFlags";
export class FiberNode {
    type: any;
    tag: WorkTag
    pendingProps: Props
    key: Key
    stateNode: any;
    ref: Ref;

    return: FiberNode | null;
    sibling: FiberNode | null;
    child: FiberNode | null;
    index: number;

    memoizedProps: Props | null
    alternate: FiberNode | null
    flgs: Flags

    constructor(tag: WorkTag, pendingProps: Props, key: Key) {
        // 实例属性
        this.tag = tag;
        this.key = key;
        // hostcompoent <div>dom
        this.stateNode = null;
        this.type = null

        // 树状结构
        this.return = null
        this.sibling = null
        this.child = null
        this.index = 0

        this.ref = null

        // 作为工作单元
        this.pendingProps = pendingProps;
        this.memoizedProps = null

        this.alternate = null
        // 副作用
        this.flgs = NoFlags
    }
}