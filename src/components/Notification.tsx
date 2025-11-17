"use client";

import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from "react";
import useNotifications from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";

export default function Notification() {
    const router = useRouter();
    const [open, setOpen] = useState<boolean>(false);
    const { notifications, markAsRead, markManyAsRead} = useNotifications();
    // const { notifications, markAsRead, markManyAsRead, markAllAsRead } = useNotifications();
    const panelRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    // Sort: unread first then recent
    const sortedNotifications = [...notifications].sort((a, b) => {
        if (a.isRead === b.isRead) return +new Date(b.createdAt) - +new Date(a.createdAt);
        return Number(a.isRead) - Number(b.isRead);
    });

    const unreadCount = sortedNotifications.filter(notification => !notification.isRead).length;

    // Auto-mark first few unread notifications as read when panel opens
    useEffect(() => {
        if (open && unreadCount > 0) {
            const visibleUnreadIds = sortedNotifications
                .filter(n => !n.isRead)
                .slice(0, 5)
                .map(n => n.id);
            if (visibleUnreadIds.length > 0) {
                markManyAsRead(visibleUnreadIds);
            }
        }
    }, [open, markManyAsRead, sortedNotifications, unreadCount]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, []);

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification.id);
        if (notification.data?.url) {
            router.push(notification.data.url);
        }
        setOpen(false);
    };

    const handleMarkAllAsRead = () => {
        // if (unreadCount > 0) {
        //     markAllAsRead();
        // }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const minutes = Math.floor(diffInHours * 60);
            return `${minutes}m ago`;
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const notificationVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.95 }
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button
                ref={buttonRef}
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group border border-transparent hover:border-gray-200"
            >
                <Bell className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-slate-700 group-hover:text-black transition-colors duration-200" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full border-2 border-white shadow-sm"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop for mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden lg:hidden"
                            onClick={() => setOpen(false)}
                        />
                        
                        {/* Panel */}
                        <motion.div
                            ref={panelRef}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={notificationVariants}
                            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                            className="fixed md:absolute lg:absolute right-4 left-4 sm:right-auto sm:left-auto md:-right-24 md:left-auto lg:-right-44 lg:left-auto mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden top-16 md:top-full lg:top-full"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80">
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                    >
                                        <CheckCheck size={14} />
                                        <span>Mark all</span>
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                {sortedNotifications.length > 0 ? (
                                    <div className="p-2 space-y-1">
                                        {sortedNotifications.map((notification, index) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                                    notification.isRead 
                                                        ? "bg-white hover:bg-gray-50" 
                                                        : "bg-blue-50/50 hover:bg-blue-100 border border-blue-100"
                                                }`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={`shrink-0 w-2 h-2 mt-2 rounded-full ${
                                                        notification.isRead ? "bg-gray-300" : "bg-blue-500"
                                                    }`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <p className={`text-sm font-medium ${
                                                                notification.isRead ? "text-gray-700" : "text-gray-900"
                                                            }`}>
                                                                {notification.title}
                                                            </p>
                                                            <ExternalLink size={14} className="shrink-0 text-gray-400 mt-0.5" />
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {notification.body}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className={`text-xs ${
                                                                notification.isRead ? "text-gray-400" : "text-blue-500 font-medium"
                                                            }`}>
                                                                {formatTime(notification.createdAt)}
                                                            </span>
                                                            {!notification.isRead && (
                                                                <div className="flex items-center space-x-1 text-blue-500">
                                                                    <Check size={12} />
                                                                    <span className="text-xs">New</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (

                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Bell size={24} className="text-gray-400" />
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-2">No notifications</h4>
                                        <p className="text-sm text-gray-500">
                                            You're all caught up! Check back later for updates.
                                        </p>
                                    </div>
                                )}
                            </div>


                            {sortedNotifications.length > 5 && (
                                <div className="p-3 border-t border-gray-100 bg-white/80">
                                    <button
                                        onClick={() => {
                                            // router.push('/notifications');
                                            setOpen(false);
                                        }}
                                        className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-150"
                                    >
                                        View all notifications
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}



