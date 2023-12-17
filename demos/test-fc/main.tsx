

import { useEffect, useState } from "react";


import ReactDom from "react-dom";


function App() {
  const [n,setN] = useState(100)
  const click = ()=>{
    console.log('111')
    setN(n+2)
  }
  return <div>

    <button onClick={click}>111</button>

    {n}


  </div>
}

const root = ReactDom.createRoot(document.querySelector('#root'))
root.render(<App />)


setTimeout(()=>{
  root.render(null)
},3000)