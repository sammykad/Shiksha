"use client";

import { markAllAsRead, markAsRead, dismissNotification } from "@/lib/notifications/notifications-actions";
import { NotificationType } from "@/generated/prisma/enums";
import {
    Bell, FileText, GraduationCap, UserX, BookOpen, ClipboardList,
    IndianRupee,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NotificationEmptyState from "./notification-empty-state";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — must match the select in getUserNotifications
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    readAt: Date | null;
    isDismissed: boolean;
    academicYearId: string | null;
    createdAt: Date;
}

interface NotificationListProps {
    initialNotifications: NotificationItem[];
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case "FEE": return <IndianRupee className="w-5 h-5 text-green-500 " />;
        case "ATTENDANCE": return <UserX className="w-5 h-5 text-red-600" />;
        case "EXAM": return <GraduationCap className="w-5 h-5 text-indigo-600" />;
        case "NOTICE": return <Bell className="w-5 h-5 text-blue-600" />;
        case "DOCUMENT": return <ClipboardList className="w-5 h-5 text-purple-600" />;
        case "LEAVE": return <BookOpen className="w-5 h-5 text-yellow-600" />;
        case "ACADEMIC_REPORT": return <FileText className="w-5 h-5 text-teal-600" />;
        default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
}

function getTypeBadgeColor(type: NotificationType): string {
    switch (type) {
        case "FEE": return "bg-orange-100 text-orange-800 border-orange-200";
        case "ATTENDANCE": return "bg-red-100    text-red-800    border-red-200";
        case "EXAM": return "bg-indigo-100 text-indigo-800 border-indigo-200";
        case "NOTICE": return "bg-blue-100   text-blue-800   border-blue-200";
        case "DOCUMENT": return "bg-purple-100 text-purple-800 border-purple-200";
        case "LEAVE": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "ACADEMIC_REPORT": return "bg-teal-100   text-teal-800   border-teal-200";
        case "GREETING": return "bg-pink-100   text-pink-800   border-pink-200";
        default: return "bg-gray-100   text-gray-800   border-gray-200";
    }
}

function formatType(type: NotificationType): string {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatTime(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const NotificationList = ({ initialNotifications, className }: NotificationListProps) => {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;

        setNotifications((prev) =>
            prev.map((n) => n.id === id ? { ...n, isRead: true, readAt: new Date() } : n)
        );

        try {
            await markAsRead(id);
        } catch {
            toast.error("Failed to update notification");
            setNotifications(initialNotifications);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;

        setIsMarkingAll(true);
        const previous = [...notifications];
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));

        try {
            await markAllAsRead();
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to update notifications");
            setNotifications(previous);
        } finally {
            setIsMarkingAll(false);
        }
    };

    const handleDismiss = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        setNotifications((prev) => prev.filter((n) => n.id !== id));

        try {
            await dismissNotification(id);
        } catch {
            toast.error("Failed to dismiss notification");
            setNotifications(initialNotifications);
        }
    };

    return (
        <div className={cn(
            "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full",
            className
        )}>

            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <div className="bg-gray-50 p-2 rounded-lg">
                            <Bell className="w-5 h-5 text-gray-600" />
                        </div>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white" />
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        <p className="text-[10px] text-gray-500 leading-none mt-0.5">
                            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                        </p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingAll}
                        className="text-[10px] h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                    >
                        Mark all read
                    </Button>
                )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <AnimatePresence initial={false} mode="popLayout">
                    {notifications.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full min-h-[350px]"
                        >
                            <NotificationEmptyState />
                        </motion.div>
                    ) : (
                        notifications.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                onClick={() => handleMarkAsRead(item.id, item.isRead)}
                                className={cn(
                                    "group relative p-4 border-b border-gray-50 cursor-pointer transition-colors",
                                    item.isRead ? "bg-white hover:bg-gray-50/80" : "bg-blue-50/30 hover:bg-blue-50/50"
                                )}
                            >
                                {/* Unread dot */}
                                {!item.isRead && (
                                    <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:opacity-0 transition-opacity" />
                                )}

                                <div className="flex gap-3 items-start">

                                    {/* Icon */}
                                    <div className={cn(
                                        "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border",
                                        item.isRead ? "bg-gray-50 border-gray-100" : "bg-white border-blue-100"
                                    )}>
                                        {getNotificationIcon(item.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-1">

                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn(
                                                "text-sm leading-snug",
                                                item.isRead ? "font-medium text-gray-700" : "font-semibold text-gray-900"
                                            )}>
                                                {item.title}
                                            </p>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                                                {formatTime(item.createdAt)}
                                            </span>
                                        </div>

                                        {item.message && (
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                                {item.message}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 pt-1">
                                            <span className={cn(
                                                "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border",
                                                getTypeBadgeColor(item.type)
                                            )}>
                                                {formatType(item.type)}
                                            </span>

                                            {/* Dismiss button */}
                                            <button
                                                onClick={(e) => handleDismiss(e, item.id)}
                                                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-100"
                                            >
                                                Dismiss
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};