

import { useEffect, useState } from "react";


import ReactDom from "react-dom";


function App() {
  const [n,setN] = useState(100)
  const [b,setB] = useState(200)
  useEffect(()=>{
    console.log('sssss')
    setB(b+1)
    
  },[n])
  const click = ()=>{
    console.log('111')
    setN(n+2)
  }
  return <div>

    <button onClick={click}>{b}</button>


    {n}


  </div>
}

const root = ReactDom.createRoot(document.querySelector('#root'))
root.render(<App />)


// setTimeout(()=>{
//   root.render(null)
// },3000)