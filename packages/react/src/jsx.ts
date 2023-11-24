// react element
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { ReactElementType, Type, Key, Ref, Props, ElementType } from 'shared/ReactTypes'

const ReactElement = function (type: Type, key: Key, ref: Ref, props: Props): ReactElementType {
    const element = {
        $$typeof: REACT_ELEMENT_TYPE,
        key,
        ref,
        props,
        type,
        __mark: 'ZhangTuo'
    }
    return element
}

export function isValidElement(object: any) {
    return (typeof object === 'object' &&
        object !== null &&
        object.$$typeof === REACT_ELEMENT_TYPE)
}

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
   
    let key: Key = null
    const props: Props = {}
    let ref: Ref = null

    for (const prop in config) {
        const val = config[prop]
        if (prop === 'key') {
            if (val !== undefined) {
                key = '' + val
            }
            continue
        }
        if (prop === 'ref') {
            if (val !== undefined) {
                ref = val
            }
            continue
        }
        if ({}.hasOwnProperty.call(config, prop)) {
            props[prop] = val;
        }
    }
    const maybeChildrenLength = maybeChildren.length;
    if (maybeChildrenLength) {
        if (maybeChildrenLength === 1) {
            props.children = maybeChildren[0]
        } else {
            props.children = maybeChildren;
        }
    }
    return ReactElement(type, key, ref, props)
}



export const jsxDEV = (type: ElementType, config: any,...a:any) => {
// todo  config.key?? 有问题
//    console.log(config,'xxx',a)
   config.key = a[0]
    let key: Key = null
    const props: Props = {}
    let ref: Ref = null

    for (const prop in config) {
        const val = config[prop]
        if (prop === 'key') {
            if (val !== undefined) {
                key = '' + val
            }
            continue
        }
        if (prop === 'ref') {
            if (val !== undefined) {
                ref = val
            }
            continue
        }
        if ({}.hasOwnProperty.call(config, prop)) {
            props[prop] = val;
        }
    }

    return ReactElement(type, key, ref, props)
}
