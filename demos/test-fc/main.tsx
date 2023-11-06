import React from 'react';
import ReactDOM from 'react-dom';
console.log(React)

const root = document.querySelector('#root')
// const jsx = <div>
//   <span>big-react</span>
// </div>
function App() {
  return <div>
    <Child></Child>
  </div>
}
function Child() {
  return <span>big-react</span>
}
ReactDOM.createRoot(root).render(<App></App>)

console.log(ReactDOM)
