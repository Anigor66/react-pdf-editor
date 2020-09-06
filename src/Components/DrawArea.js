import React, { useState, useEffect, useRef } from 'react'
import Immutable from 'immutable'

function DrawArea(props) {
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCrosshair, setIsCrosshair] = useState(false);
  const drawAreaEl = useRef(null);

  useEffect(() => {
    drawAreaEl.current.addEventListener("mouseup", handleMouseUp);
    props.getBounds({
      x: drawAreaEl.current.getBoundingClientRect().left,
      y: drawAreaEl.current.getBoundingClientRect().bottom,
    })
    return () => {
      drawAreaEl.current.removeEventListener("mouseup", handleMouseUp);
    }
  },[])

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
      page: props.page,
      type: "freehand",
    }
    props.getPaths(obj);
    setIsDrawing(true);
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) {
      return;
    }
    const point = relativeCoordinatesForEvent(e);
    props.pushPoints(point);
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
    drawAreaEl.current.addEventListener("mousedown",handleMouseDown, { once: true });
  }

  return (
    <>
    <button onClick = {addMouseDown} style = {{marginBottom: "1%", marginTop: "1%"}}>Draw</button>
    <div
        id="drawArea"
        ref={drawAreaEl}
        style = {isCrosshair ? {cursor: "crosshair"} : {cursor: props.cursor}}
        onMouseMove={handleMouseMove}
    >
      {props.children}
      <Drawing lines={props.result} page = {props.page}/>
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
  if(line.page === page && line.type === "freehand")
  {
      const pathData = "M " +
      line.arr
        .map(p => {
          return `${p.get('x')},${p.get('y')}`;
        })
        .join(" L ");
    
      return <path className="path" d={pathData} />;
  }
  return null;
}

export default DrawArea