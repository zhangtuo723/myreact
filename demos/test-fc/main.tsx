
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

// function App() {
//   const [num, setNum] = useState(100)

//   return <div onClickCapture={()=>setNum(num+1)}>{num}</div>
// }
// function Child() {
//   return <span>big-react</span>
// }

function App() {
  const [num, setNum] = useState(100)
  const arr = num % 2 === 0 ? [
    <li key='1'>1</li>,
    <li key='2'>2</li>,
    <li key='3'>3</li>,
  ] : [
    <li key='3'>3</li>,
    <li key='2'>2</li>,
    <li key='1'>1</li>

  ]
  return <ul onClickCapture={()=>{setNum(num+1)}}>
{arr}
  </ul>
}
ReactDOM.createRoot(root).render(<App></App>)

// console.log('xxx')

