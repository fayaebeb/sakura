import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SuggestionPanelProps = {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  onClose: () => void;
};

const SuggestionPanel = ({ suggestions, onSelect, onClose }: SuggestionPanelProps) => {
  return (
    <AnimatePresence>
      {suggestions.length > 0 && (
        <motion.div
          className="relative px-4 pt-4 pb-5 bg-muted/60 border-t border-border backdrop-blur-md rounded-b-xl shadow-inner"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close suggestions"
            className="absolute top-3 right-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Suggestion chips */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-2 py-1">
              {suggestions.map((sugg, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-3 py-1 text-sm border border-border bg-background hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  onClick={() => onSelect(sugg)}
                >
                  {sugg}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuggestionPanel;
