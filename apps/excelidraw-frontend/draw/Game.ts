import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

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


export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool;

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, tool: Tool) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Failed to get 2D rendering context");
        }
        this.ctx = ctx;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.selectedTool = tool;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.clearCanvas();
    }

    initHandlers() {
        window.addEventListener("resize", this.resizeCanvas.bind(this));
        this.socket.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "chat") {
                const parsedShape = JSON.parse(data.message);
                this.existingShapes.push(parsedShape);
                this.clearCanvas();
            }
        };
    }

    createStrokeRect(x: number, y: number, width: number, height: number) {
        this.ctx.strokeRect(x, y, width, height);
    }

    createStrokeCircle(x: number, y: number, radius: number) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "rgb(255, 255, 255)";

        this.existingShapes.map((e) => {
            if (e.type === "rect") {
                this.createStrokeRect(e.x, e.y, e.width, e.height);
            } else if (e.type == "circle") {
                this.createStrokeCircle(e.centerX, e.centerY, e.radius);
            }
        });
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        let shape: Shape | null = null;
        if (this.selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height,
            };
        } else if (this.selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                centerX: this.startX + radius,
                centerY: this.startY + radius,
                radius: Math.abs(radius)
            };
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);

        if (width || height) {
            this.socket.send(
                JSON.stringify({
                    type: "chat",
                    roomId: Number(this.roomId),
                    message: JSON.stringify(shape),
                }),
            );
        }
    }

    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();
            this.ctx.strokeStyle = "rgb(255, 255, 255)";

            if (this.selectedTool === 'rect') {

                this.createStrokeRect(this.startX, this.startY, width, height);
            } else if (this.selectedTool === 'circle') {
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.createStrokeCircle(centerX, centerY, Math.abs(radius));
            }
        }
    }

    initMouseHandlers() {

        this.canvas.addEventListener("mousedown", this.mouseDownHandler);

        this.canvas.addEventListener("mouseup", this.mouseUpHandler);

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}
