import React, { useState, useEffect, useRef } from 'react'
import Immutable from 'immutable'

function DrawArea(props) {
  
  const [lines, setLines] = useState([]);
  const [page, setPage] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [flag, setFlag] = useState("");
  const [redoEl, setRedoEl] = useState([]);
  const [isCrosshair, setIsCrosshair] = useState(false);
  const drawAreaEl = useRef(null);

  useEffect(() => {
    document.getElementById("drawArea").addEventListener("mouseup", handleMouseUp);
    props.getBounds({
      x: drawAreaEl.current.getBoundingClientRect().left,
      y: drawAreaEl.current.getBoundingClientRect().bottom,
    })
    return () => {
      document.getElementById("drawArea").removeEventListener("mouseup", handleMouseUp);
    }
  },[])

  useEffect(() => {
    setPage(props.page);
    setFlag(props.flag);
  })

  useEffect(() => {
    if(props.flag === "undo")
    {
      setRedoEl(arr => [...arr,lines.pop()]);
      setLines(lines);
    }
    if(props.flag === "redo")
    {
      setLines(lines => [...lines,redoEl.pop()]);
    }
    props.changeFlag();
  },[flag])

  useEffect(() => {
    if(isDrawing === false && lines.length)
    {
      props.getPaths(lines[lines.length-1]);
    }
  },[isDrawing])

  const handleMouseUp = () => {
    setIsCrosshair(false);
    setIsDrawing(false);
  }

  const handleMouseDown = (e) => {

    if (e.button !== 0) {
      return;
    }
    const point = relativeCoordinatesForEvent(e);
    let obj = {
      arr: [point],
      page: page,
      type: "freehand",
    }
    setLines(prevlines => [...prevlines,obj]);
    setIsDrawing(true);
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) {
      return;
    }
    const point = relativeCoordinatesForEvent(e);
    let last = lines.pop();
    last.arr.push(point);
    setLines(prevlines =>[...prevlines,last]);  
  }


  const relativeCoordinatesForEvent = (e) => {
    const boundingRect = drawAreaEl.current.getBoundingClientRect();
    return new Immutable.Map({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });
  }

  const addMouseDown = () => {
    setIsCrosshair(true);
    document.getElementById("drawArea").addEventListener("mousedown",handleMouseDown, { once: true });
  }

  return (
    <>
    <button onClick = {addMouseDown} style = {{marginBottom: "1%", marginTop: "1%"}}>Draw</button>
    <div
        id="drawArea"
        ref={drawAreaEl}
        className = {isCrosshair ? "crosshair" : ""}
        onMouseMove={handleMouseMove}
    >
      {props.children}
      <Drawing lines={lines} page = {page}/>
    </div>
    </>
  )

}

function Drawing({ lines, page }) {
  return (
    <svg className="drawing" style = {{zIndex:10}}>
      {lines.map((line, index) => (
        <DrawingLine key={index} line={line} page = {page}/>
      ))}
    </svg>
  );
}

function DrawingLine({ line, page }) {
  const pathData = "M " +
    line.arr
      .map(p => {
        return `${p.get('x')},${p.get('y')}`;
      })
      .join(" L ");
  
  if(line.page === page)
  {
    return <path className="path" d={pathData} />;
  }
  return null;
}

export default DrawArea