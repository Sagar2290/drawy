import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkY2EyNTg3ZC05Mzc3LTRjMmUtYmVjNS0wZDBjZGM1ZWIyYjgiLCJpYXQiOjE3NTAxNjA3MjZ9.Z37vS042T3wRB_7xac53w4W0b_nbqOh7_hZvYkQKSqE`,
    );
    ws.onopen = () => {
      setSocket(ws);
      setLoading(false);
    };
  }, []);

  return {
    socket,
    loading,
  };
}
