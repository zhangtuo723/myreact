const supporSymbol = typeof Symbol === 'function' &&  Symbol.for;

export const REACT_ELEMENT_TYPE = supporSymbol
? Symbol.for('react.element')
:0xeac7
