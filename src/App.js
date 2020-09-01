import React, {useState, useRef} from 'react';
import './App.css';
import samplePDF from "./na.pdf";
import SinglePage from './Components/SinglePage';
import ModifyPage from './Components/ModifyPage';
import AutoTextArea from './Components/AutoTextArea';

export default function App() {
  const [result, setResult] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [redoStack, setRedoStack] = useState([]);
  const [flag, setFlag] = useState("");
  const [bounds, setBounds] = useState({});
  const tempRef = useRef(null);

  const pageChange = (num) => {
    setPageNumber(num);
  }

  const addText = () => {
    document.getElementById("drawArea").addEventListener("click", (e) => {
      e.preventDefault();
      setResult(result => [...result, {id:generateKey(e.pageX), x: e.pageX, y: e.pageY -20, text: "", page: pageNumber, type: "text", ref: tempRef}]);
    }, { once: true });
  }

  const undo = () => {
    let temp = result.pop();
    if(temp)
    {
      if(temp.type === "freehand")
      {
        setFlag("undo");
      }
      setRedoStack(stack => [...stack,temp]);
      setResult(result);
    }
  }

  const changeFlag = () => {
    setFlag("");
  }

  const redo = () => {
    let top = redoStack.pop();
    if(top)
    {
      if(top.type === "freehand")
      {
        setFlag("redo");
      }
      setResult(res => [...res,top]);
    }
  }

  const getPaths = (el) => {
    setResult(res => [...res,el]);
  }

  const getBounds = (obj) =>{
    setBounds(obj);
  }

  const generateKey = (pre) => {
    return `${ pre }_${ new Date().getTime() }`;
  }

  const onTextChange = (id, txt, ref) => {
    let indx = result.findIndex(x => x.id === id);
    let item = {...result[indx]};
    item.text = txt;
    item.ref = ref;
    result[indx] = item;
    setResult(result);
  }

  return (
    <div className="App" >
    {
      result.map((res) => {
        if(res.type === "text")
        {
          let isShowing = "none";
          if(res.page === pageNumber)
          {
            isShowing = "block";
          }
          return(
            <AutoTextArea key = {res.id} unique_key = {res.id} val = {res.text} onTextChange = {onTextChange} style = {{display: isShowing, color: "red" ,fontWeight:'normal', fontSize: 16, zIndex:20, position: "absolute", left: res.x+'px', top: res.y +'px'}}></AutoTextArea>
            //<h1 key={index} style = {{textAlign: "justify",color: "red" ,fontWeight:'normal',width: 200, height: 80,fontSize: 33+'px', fontSize: 16, zIndex:10, position: "absolute", left: res.x+'px', top: res.y +'px'}}>{res.text}</h1>
          )
        }
        else
        {
          return(null);
        }
      })
    }
      
      <h1 style = {{color: "#3f51b5"}}>REACT PDF EDITOR</h1>

      <hr/>
      
      <button onClick = {undo} style = {{marginTop: "1%"}}>Undo</button>
      <button onClick = {redo} style = {{marginTop: "1%"}}>Redo</button>
      <br></br>
      <button onClick={addText} style = {{marginTop: "1%"}}>Add Text</button>
      <SinglePage pdf = {samplePDF} pageChange = {pageChange} getPaths = {getPaths} flag = {flag} getBounds ={getBounds} changeFlag = {changeFlag}/>
      <ModifyPage pdf = {samplePDF} result = {result} bounds = {bounds}/>
      <hr></hr>
    </div>
  );
}
