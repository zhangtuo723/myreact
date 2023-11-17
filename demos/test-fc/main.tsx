
import ReactDOM from 'react-dom';
// console.log('xxx')
import { useState } from 'react'



const root = document.querySelector('#root')
// // const jsx = <div>
// //   <span>big-react</span>
// // </div>
// function App() {
//   const [num, setNum] = useState(100)
//   window.setNum = setNum
//   return <div>
//     {num === 3 ? <Child></Child> :  num}
//   </div>
// }

function App() {
  const [num, setNum] = useState(100)
 
  return <div onClick={()=>setNum(num+1)}>{num}</div>
}
function Child() {
  return <span>big-react</span>
}
ReactDOM.createRoot(root).render(<App></App>)

// console.log('xxx')

