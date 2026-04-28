"use client";

import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconsBotton";
import { Circle, Pencil, RectangleHorizontal } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "pencil" | "rect" | "circle";

export function Canvas({
    roomId,
    socket,
}: {
    roomId: string;
    socket: WebSocket;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("pencil");

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket, selectedTool);
            setGame(g);

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef]);

    return (
        <div className="h-screen w-screen">
            <canvas ref={canvasRef}></canvas>
            {/* <div className="fixed top-1 left-1">hello</div> */}
            <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
        </div>
    );
}

function Topbar({
    selectedTool,
    setSelectedTool,
}: {
    selectedTool: Tool;
    setSelectedTool: (e: Tool) => void;
}) {
    return (
        <div className="fixed top-1 left-1 flex gap-3">
            <IconButton
                icon={<Pencil />}
                onClick={() => {
                    setSelectedTool("pencil");
                }}
                activated={selectedTool === "pencil"}
            />
            <IconButton
                icon={<RectangleHorizontal />}
                onClick={() => {
                    setSelectedTool("rect");
                }}
                activated={selectedTool === "rect"}
            />
            <IconButton
                icon={<Circle />}
                onClick={() => {
                    setSelectedTool("circle");
                }}
                activated={selectedTool === "circle"}
            />
        </div>
    );
}
