const supporSymbol = typeof Symbol === 'function' &&  Symbol.for;

export const REACT_ELEMENT_TYPE = supporSymbol
? Symbol.for('react.element')
:0xeac7
export const REACT_FRAGMENT_TYPE = supporSymbol?Symbol.for('react.fragment') :0xeacb