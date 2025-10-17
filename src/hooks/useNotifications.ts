import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import useSWR from "swr";
import { useSession } from "next-auth/react";

type Notification = {
  id: string;
  receiverId: string;
  senderId?: string | null;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function useNotifications() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  const { data, mutate } = useSWR(userId ? "/api/notifications" : null, fetcher, { refreshInterval: 0 });

  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback(async () => {
    if (!userId) return;

    try {
      // get short-lived token from Next.js
      const res = await fetch("/api/auth/socket-token");
      if (!res.ok) {
        console.warn("socket-token failed");
        return;
      }
      const { token } = await res.json();

      const s = io(process.env.SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        withCredentials: true,
      });

      s.on("connect", () => console.log("socket connected", s.id));
      s.on("connect_error", (err: any) => console.error("socket connect_error", err));
      s.on("disconnect", (reason) => console.warn("socket disconnected", reason));

      s.on("getNotification", (notif: Notification) => {
        mutate((prev: any) => {
          const arr = prev?.data ?? [];
          return { ...prev, data: [notif, ...arr] };
        }, false);
      });

      s.on("notificationsMarkedRead", (ids: string[]) => {
        mutate((prev: any) => {
          const arr: Notification[] = prev?.data ?? [];
          return {
            ...prev,
            data: arr
              .map(n => (ids.includes(n.id) ? { ...n, isRead: true } : n))
              .sort((a,b) => Number(a.isRead) - Number(b.isRead) || (+new Date(b.createdAt) - +new Date(a.createdAt)))
          };
        }, false);
      });

      socketRef.current = s;
    } catch (e) {
      console.error("connectSocket error", e);
    }
  }, [userId, mutate]);

  useEffect(() => {
    if (userId) connectSocket();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // mark as read (keeps your current usage)
  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    mutate(); // revalidate
    socketRef.current?.emit("markAsRead", [id]);
  };

  const markManyAsRead = async (ids: string[]) => {
    await Promise.all(ids.map(id => fetch(`/api/notifications/${id}/read`, { method: "PATCH" })));
    mutate();
    socketRef.current?.emit("markAsRead", ids);
  };

  return {
    notifications: (data?.data ?? []) as Notification[],
    mutate,
    markAsRead,
    markManyAsRead,
  };
}
