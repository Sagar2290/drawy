"use client";

import { WS_BACKEND } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2EyNTg3ZC05Mzc3LTRjMmUtYmVjNS0wZDBjZGM1ZWIyYjgiLCJpYXQiOjE3NTAyNTE0Mzl9.iL95IKBC7CF2-eNlHLBvWo3myTwDFmN2WFzjauPRjVw";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BACKEND}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      const data = JSON.stringify({
        type: "join_room",
        roomId: Number(roomId),
      });
      ws.send(data);
    };
  }, []);

  if (!socket) {
    return <div>connecting to server</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
