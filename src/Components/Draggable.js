import React from 'react'
import { useState, useEffect, useRef } from 'react';

function Draggable(props) {
    const[pos,setPos] = useState({x: props.x, y:props.y});
    const[isDragging,setIsDragging] = useState(false);
    const[rel,setRel] = useState({x: 0, y: 0});
    const dragRef = useRef(null);
    
    useEffect(() => {
        return () =>
        {
            dragRef.current.removeEventListener("mousemove", handleMouseMove);
            dragRef.current.removeEventListener("mouseup", handleMouseUp);            
        }
    },[])

    const handleMouseDown = (e) => {
        if(e.button !== 0) 
            return;
        setIsDragging(true);
        setRel({
            x: e.pageX - dragRef.current.offsetLeft,
            y: e.pageY - dragRef.current.offsetTop,
        });
        e.stopPropagation();
        e.preventDefault();
    }

    const handleMouseMove = (e) => {
        if(!isDragging)
            return;
        setPos({
            x: e.pageX - rel.x,
            y: e.pageY - rel.y
        })
        e.stopPropagation();
        e.preventDefault();        
    }

    const handleMouseUp = (e) => {
        setIsDragging(false);
        e.stopPropagation();
        e.preventDefault();
    }

    return (
        <div style = {{
            cursor: "pointer",
            position: "absolute",
            left: pos.x,
            top: pos.y 
        }}
        ref = {dragRef}
        onDoubleClick = {handleMouseDown}
        onMouseUp = {handleMouseUp}
        onMouseMove = {handleMouseMove}>
        {props.children}
        </div>
    )
}

export default Draggable
