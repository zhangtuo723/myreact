export type Type = any;
export type Key = any;
export type Ref = any;
export type Props = any;
export type ElementType = any;

export interface ReactElementType {
	$$typeof: symbol | number;
	type: ElementType;
	key: Key;
	props: Props;
	ref: Ref;
	__mark: string;
}

// 两种出发更新方式 setState(newState) , setState((state)=>newState)
export type Action<State> = State | ((prevState:State)=>State)