
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
  const[n, setN] = useState(1)  
  // const arr = num % 2 === 0 ? [
  //   { key: 1, c: 1 },
  //   { key: 2, c: 2 },
  //   { key: 3, c: 3 },
  //   { key: 4, c: 4 }



  // ] : [
  //   { key: 3, c: 3 },
  //   { key: 2, c: 2 },
  //   { key: 1, c: 1 },
  //   { key: 4, c: 4 }

  // ]
  const arr = num%2==0? [<li key={1}>1</li>,<li key={2}>2</li>]:[<li key={3}>3</li>,<li key={4}>4</li>]
  const click = () => {
    setNum(num + 1); 
    setN(100)
  }
  

  return <ul onClickCapture={click}>
  
  <li>3</li>
  <li>4</li>
  {arr}
</ul>

  // return <ul onClickCapture={click}>
  //   {arr.map(v => <li key={v.key}>{v.c}</li>)}
  // </ul>
}
ReactDOM.createRoot(root).render(<App></App>)

// console.log('xxx')

