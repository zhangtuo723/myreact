
import ReactDOM from 'react-dom';
import {useState} from 'react'


const root = document.querySelector('#root')
// const jsx = <div>
//   <span>big-react</span>
// </div>
function App() {
  const [num,setNum] = useState(100)
  const [num1,setNum1] = useState(200)
  return <div>
   {num+num1}
  </div>
}
function Child() {
  return <span>big-react</span>
}
ReactDOM.createRoot(root).render(<App></App>)

console.log(ReactDOM)
