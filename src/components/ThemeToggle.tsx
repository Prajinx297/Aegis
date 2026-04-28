import { AnimatePresence, motion } from "framer-motion";
import { MoonStar, SunMedium } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

export function ThemeToggle() {
  const { theme, toggleTheme } = useSimulation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-11 w-20 items-center rounded-full border border-aegis-border bg-aegis-card px-2"
      aria-label="Toggle theme"
    >
      <motion.span
        layout
        className="absolute h-8 w-8 rounded-full bg-aegis-primary shadow-glow"
        animate={{ x: theme === "dark" ? 0 : 36 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative z-10 flex w-full items-center justify-between px-0.5 text-white"
        >
          <MoonStar className="h-4 w-4" />
          <SunMedium className="h-4 w-4" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
