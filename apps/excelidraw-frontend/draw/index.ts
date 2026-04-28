import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
    | {
        type: "rect";
        x: number;
        y: number;
        width: number;
        height: number;
    } | {
        type: "circle";
        centerX: number;
        centerY: number;
        radius: number;
    } | {
        type: 'pencil',
        startX: number,
        startY: number,
        endX: number,
        endY: number
    };

export async function initDraw(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
) {
    const ctx = canvas.getContext("2d");

    const existingShapes: Shape[] = await getExistingShapes(roomId);

    if (!ctx) {
        return;
    }

    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.type === "chat") {
            const parsedShape = JSON.parse(data.message);
            existingShapes.push(parsedShape);
            clearCanvas(existingShapes, canvas, ctx);
        }
    };

    let clicked = false;
    let startX = 0;
    let startY = 0;

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        clearCanvas(existingShapes, canvas, ctx);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;

        const selectedTool = 'circle'

        let shape: Shape | null = null;
        if (selectedTool === "rect") {
            shape = {
                type: "rect",
                x: startX,
                y: startY,
                width,
                height,
            };
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                centerX: startX + radius,
                centerY: startY + radius,
                radius: Math.abs(radius)
            };
        }

        if (!shape) {
            return;
        }

        existingShapes.push(shape);

        if (width || height) {
            socket.send(
                JSON.stringify({
                    type: "chat",
                    roomId: Number(roomId),
                    message: JSON.stringify(shape),
                }),
            );
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeStyle = "rgb(255, 255, 255)";

            const selectedTool = 'circle'

            if (selectedTool === 'rect') {

                ctx.strokeRect(startX, startY, width, height);
            } else if (selectedTool === 'circle') {
                const radius = Math.max(width, height) / 2;
                const centerX = startX + radius;
                const centerY = startY + radius;
                ctx.beginPath();
                ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
            }
        }
    });
}

function clearCanvas(
    existingShapes: Shape[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgb(255, 255, 255)";

    existingShapes.map((e) => {
        if (e.type === "rect") {
            ctx.strokeRect(e.x, e.y, e.width, e.height);
        } else if (e.type == "circle") {
            ctx.beginPath();
            ctx.arc(e.centerX, e.centerY, e.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
        }
    });
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((e: { message: string }) => {
        const messageData = JSON.parse(e.message);
        return messageData;
    });

    return shapes;
}
