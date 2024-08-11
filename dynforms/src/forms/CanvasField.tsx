import { Interfaces } from "./Form";

import { useRef, useEffect, useState } from "react";
import { arrayGet } from "../helpers/generalHelper";

const CanvasField = (props: any) => {
    const field: Interfaces.TextareaField = props.field;
    let { keys, record, onValueChange } = props;

    if (!field) {
        return;
    }

    if (!record) {
        record = {};
    }

    const path = keys.join(".");
    const fullKey = path ? `${path}.${field.key}` : field.key; 
    const value = arrayGet(record, fullKey, null);

    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const [mouseDown, setMouseDown] = useState(false);
    const [loaded, setLoaded] = useState(false);

    function getCanvasContext()  { 
        const canvas = canvasRef.current as HTMLCanvasElement | null;
        return { 
            canvas: canvas,
            context: canvas?.getContext("2d") as CanvasRenderingContext2D | null
        }
    }

    function loadImage() {
        const { canvas, context } = getCanvasContext();
        if (!canvas || !context) {
            return;
        }

        const img = new Image();
        img.src = value;
        img.onload = () => {
            context.drawImage(img, 0, 0);
            setLoaded(true);
        };
    }

    const clearCanvas = () => {
        const { canvas, context } = getCanvasContext();
        if (!canvas || !context) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        onValueChange(null);
    };

    function clearBtnClick(event: React.MouseEvent<HTMLAnchorElement>) {
        event.preventDefault();
        clearCanvas();
    }


    useEffect(() => {
        const { canvas, context } = getCanvasContext();
        if (!canvas || !context) {
            return;
        }

        context.lineWidth = 2;
        context.lineCap = "round";
        context.strokeStyle = field.strokeStyle ?? 'black';

        const getPos = (event: any) => {
            if (event.touches) {
                return {
                    x: event.touches[0].clientX - canvas.offsetLeft,
                    y: event.touches[0].clientY - canvas.offsetTop,
                };
            } else {
                return { x: event.clientX - canvas.offsetLeft, y: event.clientY - canvas.offsetTop };
            }
        };

        const startDrawing = (event: any) => {
            const pos = getPos(event);
            setLastPos(pos);
            setIsDrawing(true);
        };

        const draw = (event: any) => {
            if (!isDrawing) return;
            const pos = getPos(event);
            context.beginPath();
            context.moveTo(lastPos.x, lastPos.y);
            context.lineTo(pos.x, pos.y);
            context.stroke();
            setLastPos(pos);
        };

        const endDrawing = () => {
            setIsDrawing(false);
            if (mouseDown) {
                // Only trigger value change if the mouse is actually down at this point.
                onValueChange(canvas.toDataURL());
            }
        };

        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", endDrawing);
        canvas.addEventListener("mouseout", endDrawing);

        canvas.addEventListener("touchstart", startDrawing);
        canvas.addEventListener("touchmove", draw);
        canvas.addEventListener("touchend", endDrawing);

        return () => {
            canvas.removeEventListener("mousedown", startDrawing);
            canvas.removeEventListener("mousemove", draw);
            canvas.removeEventListener("mouseup", endDrawing);
            canvas.removeEventListener("mouseout", endDrawing);

            canvas.removeEventListener("touchstart", startDrawing);
            canvas.removeEventListener("touchmove", draw);
            canvas.removeEventListener("touchend", endDrawing);
        };
    }, [isDrawing, lastPos, record, mouseDown]);

    if (!loaded && value) {
        loadImage();
    }
    
    return (
        <div className="field-canvas">
            <canvas
                ref={canvasRef}
                width={field.width ?? 300}
                height={field.height ?? 300}
                onMouseDown={() => setMouseDown(true)}
                onMouseUp={() => setMouseDown(false)}
            />
            <a href="" className="canvas-clear" onClick={clearBtnClick}>
                Clear
            </a>
        </div>
    );
};

export default CanvasField;
