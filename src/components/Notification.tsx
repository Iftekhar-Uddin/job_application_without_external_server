"use client";

import { Bell } from "lucide-react";
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from "react";
import useNotifications from "@/hooks/useNotifications";


export default function Notification() {
    const router = useRouter();
    const [open, setOpen] = useState<boolean>(false);
    const { notifications, markAsRead, markManyAsRead } = useNotifications();
    const listRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    // Sort: unread first then recent
    const sorted = [...notifications].sort((a, b) => {
        if (a.isRead === b.isRead) return +new Date(b.createdAt) - +new Date(a.createdAt);
        return Number(a.isRead) - Number(b.isRead); // unread (false -> 0) first
    });

    useEffect(() => {
        if (!listRef.current) return;
        // detect items visible and mark read when panel opened (simpler approach)
        const visibleUnreadIds = sorted.filter(n => !n.isRead).slice(0, 5).map(n => n.id);
        if (visibleUnreadIds.length) {
            markManyAsRead(visibleUnreadIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close panel on outside click
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
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unredMessage = sorted.filter((sort) => sort.isRead === false);



    return (
        <div className="relative inline-block z-10">
            <button ref={buttonRef} onClick={() => setOpen(!open)} className="relative p-1.5 md:p-2 rounded-full text-slatee-500 flex hover:bg-slate-200">
                <Bell className="w-5.5 h-5.5 rounded-full cursor-pointer text-slate-500"/>
                {unredMessage.length > 0 && (
                    <span className="absolute -top-2 -right-2 md:-top-1 md:-right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-black rounded-full">
                        {unredMessage.length}
                    </span>
                )}
            </button>

            {open && sorted.length > 0 && (
                <div ref={panelRef} className="bg-slate-100 absolute -right-18 md:left-full w-[94vw] sm:w-[60vw] md:w-72 top-8.5 md:top-12.5 p-3 rounded-sm md:rounded-md ring-1 ring-slate-500">
                    <div className="flex flex-col text-sm md:text-base max-h-fit h-80 overflow-y-scroll font-sans divide-y divide-slate-500 scrollbar-hide">
                        {sorted.map((n) => (
                            <div key={n.id} className="py-2 first:pt-0 last:pb-0">
                                <li
                                    className={`list-none ${n.isRead ? "bg-white" : "bg-slate-100 hover:bg-gray-200"} px-2 py-1 rounded-sm cursor-pointer`}
                                    onClick={() => {
                                        markAsRead(n.id);
                                        router.push(n.data?.url);
                                        setOpen(false);
                                    }}
                                >
                                    <b>{n?.title} </b> application status has been changed to {n.body}
                                    <p
                                        className={`text-sm ${n.isRead ? "text-gray-500" : "text-green-600"
                                            }`}
                                    >
                                        {new Date(n.createdAt).toLocaleString()}
                                    </p>
                                </li>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};



// useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//         const target = event.target as Node;

//         if (
//             // not inside the notification panel
//             panelRef.current &&
//             !panelRef.current.contains(target) &&
//             // not inside the bell button
//             buttonRef.current &&
//             !buttonRef.current.contains(target) &&
//             // not inside the external ref (if provided)
//             (!mouseRef?.current || !mouseRef.current.contains(target))
//         ) {
//             setOpen(false);
//         }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
// }, [mouseRef]);



// Example: when user opens panel, mark visible items as read after 1s
// useEffect(() => {
//     if (!listRef.current) return;
//     // detect items visible and mark read when panel opened (simpler approach)
//     const visibleUnreadIds = sorted.filter(n => !n.isRead).slice(0, 5).map(n => n.id);
//     if (visibleUnreadIds.length) {
//         markManyAsRead(visibleUnreadIds);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);


// bg-amber-100 absolute right-4 md:left-full w-40 sm:w-56 md:w-72 top-8 md:top-12 p-2 md:p-4 rounded-sm md:rounded-md ring-1 ring-orange-500

{/* {!n.isRead && <button className="cursor-pointer flex mx-auto bg-slate-300 px-2 rounded-sm md:rounded-md" >Mark as read</button>} */ }

// {" "} {n.type === "Rejected" ? "application has been Rejected" : n.type === "Accepted" ? "application has been Accepted" : "application has been Reviewed"}

// {/* <div className="absolute md:top-13.5 md:left-full -right-11 w-48 md:w-72 lg:w-md md:p-4 rounded-lg bg-white text-black flex flex-col gap-4 text-sm md:text-base">
//     {notifications.map(n => (
//         <ul className='' key={n.id}>
//             <li className="px-2 py-1 hover:bg-gray-100 rounded-sm md:rounded-md cursor-pointer" onClick={() => { router.push(n.data?.link), setOpen(false) }}>
//                 <b>{n.data?.title} </b>{" "} {n.type === "Rejected" ? "application has been Rejected" : n.type === "Accepted" ? "application has been Accepted" : "application has been Reviewed"}
//                 <p className="text-sm text-emerald-600">{new Date(n.createdAt).toLocaleString()}</p>
//                 {/* {!n.isRead && <button className="cursor-pointer flex mx-auto bg-slate-300 px-2 rounded-sm md:rounded-md" >Mark as read</button>} */}
//             </li>
//         </ul>))}
//     {notifications.length > 0 && <button className='bg-black text-white py-1 md:py-1.5 mb-1.5 md:mb-0 w-28 mx-auto md:w-full text-sm cursor-pointer rounded-sm md:rounded-lg' onClick={(reset)}>Mark All Read</button>}
// </div> */}

