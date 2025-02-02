"use client";

import { toast } from "sonner";
import { useEffect } from "react";

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  useEffect(() => {
    if ("success" in message) {
      toast.success(message.success);
    } else if ("error" in message) {
      toast.error(message.error);
    } else if ("message" in message) {
      toast(message.message);
    }
  }, [message]);

  return null;
}
