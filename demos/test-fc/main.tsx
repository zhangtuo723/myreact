
// import ReactDOM from 'react-noop-renderer';


// function App() {
//   return (
//     <>
//       <Child />
//       <div>hello world</div>
//     </>
//   );
// }

function Child() {
  // useEffect(() => {
  //   console.log('child effect');
  //   return () => {
  //     console.log('child卸载了');

  //   }
  // })
  return 'Child';
}

import { useEffect, useState } from "react";
// const root = ReactDOM.createRoot()
// root.render(<App></App>)
// window.root = root

import ReactDom from "react-dom";


function App() {
  const [n,setN] = useState(100)
  const click = ()=>{
    console.log('111')
    setN(n+2)
  }
  return <>

    <div onClick={click}>111</div>
    {n}


  </>
}

const root = ReactDom.createRoot(document.querySelector('#root'))
root.render(<App />)


