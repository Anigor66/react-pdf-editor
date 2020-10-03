import React, { useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
function ModifyPage(props) {

    useEffect(() => {
        if(props.buttonType === "download")
        {
            modifyPdf();
            props.resetButtonType();
        }
    },[props.buttonType])
    
    async function modifyPdf()
    {
          const existingPdfBytes = await fetch(props.pdf).then(res => 
            {
                return(res.arrayBuffer());
            })

        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const pages = pdfDoc.getPages()
        const textSize = 16

        props.result.forEach((res) => {
            if(res.type === "text")
            {
                console.log(res.x,res.y,res.ref.current.offsetLeft,res.ref.current.offsetTop);
                console.log("Width",res.ref.current.getBoundingClientRect().width, res.ref.current.offsetWidth);
                pages[res.page - 1].drawText(res.text, {
                    x: res.ref.current.offsetLeft - props.bounds.x,
                    y: props.bounds.y - res.ref.current.offsetTop -17,
                    size: textSize,
                    font: helveticaFont,
                    color: rgb(0.95, 0.1, 0.1),
                    maxWidth: res.ref.current.getBoundingClientRect().width,
                    lineHeight: 15
                })
            }
            if(res.type === "freehand")
            {
                const pathData = "M " +
                res.arr
                .map(p => {
                    return `${p.get('x')},${p.get('y')}`;
                })
                .join(" L ");
                pages[res.page-1].moveTo(0, pages[0].getHeight());
                pages[res.page-1].drawSvgPath(pathData,{
                    borderColor: rgb(0.95, 0.1, 0.1),
                });
            }
        })
        
        const pdfBytes = await pdfDoc.save()

        let blob = new Blob([pdfBytes], {type: "application/pdf"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        let fileName = "na2";
        link.download = fileName;
        link.click();

    }

    return (
        <div>
            {/*<button style = {{marginTop: "1%"}} onClick = {modifyPdf}>Download PDF</button>*/}
        </div>
    )
}

export default ModifyPage
