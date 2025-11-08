import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import type { Announcement } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  const { data: announcement } = useQuery<Announcement | null>({
    queryKey: ["/api/announcement"],
  });

  if (!announcement || !announcement.enabled || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative overflow-hidden bg-primary text-primary-foreground"
        data-testid="announcement-banner"
      >
        <div className="relative flex items-center justify-center py-2 px-4">
          <motion.div
            animate={{ x: [0, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center gap-4 text-sm font-medium"
          >
            <span className="whitespace-nowrap" data-testid="text-announcement-message">
              {announcement.message}
            </span>
            {announcement.link_url && announcement.link_text && (
              <a
                href={announcement.link_url}
                className="underline underline-offset-4 hover:no-underline whitespace-nowrap"
                data-testid="link-announcement-cta"
              >
                {announcement.link_text}
              </a>
            )}
          </motion.div>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 h-6 w-6"
            onClick={() => setIsVisible(false)}
            data-testid="button-close-announcement"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
