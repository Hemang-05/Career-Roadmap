// components/NotificationPopup.tsx
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  message: string;
  created_at: string;
}

export const NotificationPopup: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Polling every 10s
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, message, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) console.error("Error fetching notifications:", error.message);
      else if (data) setNotifications(data);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Rotate notifications every 3 seconds
  useEffect(() => {
    if (!notifications.length) return;
    const rotate = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 3000);
    return () => clearInterval(rotate);
  }, [notifications]);

  if (!notifications.length) return null;
  const current = notifications[currentIndex];

  return (
    <div className="fixed left-8 bottom-8 z-50">
      <AnimatePresence>
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.7 }}
          className="w-64 p-3 bg-orange-100 bg-opacity-40 backdrop-blur-sm border border-orange-200 shadow-lg rounded-2xl"
        >
          <p className="text-sm font-medium text-gray-800">{current.message}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
