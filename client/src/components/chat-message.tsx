import { Message } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui/avatar";
import { Card } from "./ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileText, Globe, Volume2, Tag, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

// Cute decorative elements to randomly add to bot messages
const botDecorations = [
  "🌸", "✨", "💮", "💕", "🎀", "🌟", "⭐", "🌷", "🌹", "🌈"
];

// Helper function to add decorations to bot messages
const addRandomDecoration = (original: string) => {
  if (Math.random() > 0.3) return original;
  const decoration = botDecorations[Math.floor(Math.random() * botDecorations.length)];
  const position = Math.floor(Math.random() * 3);
  if (position === 0) return `${decoration} ${original}`;
  if (position === 1) return `${original} ${decoration}`;
  return `${decoration} ${original} ${decoration}`;
};

// Helper function to parse message content into sections
const parseMessageContent = (content: string) => {
  const sections = {
    mainText: "",
    companyDocs: "",
    onlineInfo: ""
  };

  // Split by company docs marker
  const [beforeCompanyDocs, afterCompanyDocs = ""] = content.split("### 社内文書情報:");
  sections.mainText = beforeCompanyDocs.trim();

  // Split remaining content by online info marker
  const [companyDocs, onlineInfo = ""] = afterCompanyDocs.split("### オンラインWeb情報:");
  sections.companyDocs = companyDocs.trim();
  sections.onlineInfo = onlineInfo.trim();

  return sections;
};

const MessageSection = ({ 
  title, 
  content, 
  icon: Icon 
}: { 
  title: string; 
  content: string; 
  icon: React.ComponentType<any>; 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!content) return null;

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="mt-3 rounded-lg border border-pink-100 overflow-hidden transition-all duration-200"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-2 hover:bg-pink-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-700">{title}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-pink-500" />
          </motion.div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-3 bg-pink-50/50"
        >
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  const fileIdMatch = href?.match(/\/file\/d\/([^/?]+)/);
                  const fileId = fileIdMatch?.[1];
                  const rawText = children?.toString() || "";
                  const startsWithIcon = rawText.startsWith("📄");
                  const filename = rawText.replace(/^📄\s*/, "");
                  const isPreviewable = fileId && /\.(pdf|txt|docx)$/i.test(filename);

                  const [showPreview, setShowPreview] = useState(false);

                  if (!isPreviewable) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C04C75] hover:text-[#F28CA8] underline"
                      >
                        {children}
                      </a>
                    );
                  }

                  return (
                    <>
                      <div className="inline-flex items-center gap-1">
                        {startsWithIcon && <span>📄</span>}
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C04C75] hover:text-[#F28CA8] underline"
                        >
                          {filename}
                        </a>
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="text-pink-500 hover:text-pink-700"
                          title={showPreview ? "Hide preview" : "Show preview"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {showPreview && (
                        <div className="mt-2 w-full">
                          <iframe
                            src={`https://drive.google.com/file/d/${fileId}/preview`}
                            width="100%"
                            height="200"
                            className="rounded-md border border-pink-200 shadow"
                            allow="autoplay"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Get badge variant based on category
const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case "SELF":
      return "default"; // Default blue-ish style
    case "PRIVATE":
      return "secondary"; // Gray style
    case "ADMINISTRATIVE":
      return "destructive"; // Red style
    default:
      return "default";
  }
};

export default function ChatMessage({
  message,
  isPlayingAudio,
  playingMessageId,
  onPlayAudio,
}: {
  message: Message;
  isPlayingAudio: boolean;
  playingMessageId: number | null;
  onPlayAudio: (messageId: number, text: string) => void;
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ x: 0, y: 0 });
  const [decoration, setDecoration] = useState<string | null>(null);

  useEffect(() => {
    if (message.isBot && Math.random() > 0.7) {
      setDecoration(botDecorations[Math.floor(Math.random() * botDecorations.length)]);
    }
  }, [message.isBot]);

  const handleBotMessageHover = () => {
    if (message.isBot) {
      setShowEmoji(true);
      setEmojiPosition({
        x: Math.random() * 40 - 20,
        y: -20 - Math.random() * 20,
      });
      setTimeout(() => setShowEmoji(false), 1000);
    }
  };

  // Parse message content if it's a bot message
  const sections = message.isBot ? parseMessageContent(message.content) : null;

  return (
    <div
      className={cn("flex w-full my-4 relative", {
        "justify-end": !message.isBot,
        "justify-start": message.isBot
      })}
    >
      {showEmoji && message.isBot && (
        <motion.div
          className="absolute text-base sm:text-lg z-10"
          style={{
            left: message.isBot ? "2rem" : "auto",
            right: message.isBot ? "auto" : "2rem",
            top: "0",
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
          animate={{
            x: emojiPosition.x,
            y: emojiPosition.y,
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.8],
            rotate: [-5, 5, -5],
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {Math.random() > 0.5 ? "💕" : "✨"}
        </motion.div>
      )}

      {message.isBot && decoration && (
        <motion.div 
          className="absolute -top-2 sm:-top-3 -left-1 text-xs sm:text-sm"
          animate={{ 
            y: [0, -3, 0],
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {decoration}
        </motion.div>
      )}

      {message.isBot && (
          <Avatar className="hidden sm:flex flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 border border-pink-300 shadow-md">
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ rotate: { duration: 0.5 } }}
          >
            <img
              src="/images/sakura-dp.png"
              alt="Sakura AI"
              className="w-full h-full object-cover rounded-full border-2 border-pink-400 shadow-md"
            />
          </motion.div>
        </Avatar>
      )}

      <motion.div
        initial={message.isBot ? { x: -10, opacity: 0 } : { x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={message.isBot ? { scale: 1.02 } : { scale: 1 }}
        onHoverStart={handleBotMessageHover}
        className={cn("rounded-xl", {
          "max-w-[85%] sm:max-w-[75%] ml-auto self-end": !message.isBot,
          "max-w-[90%] sm:max-w-[90%] mr-auto self-start ml-2 sm:ml-3": message.isBot,
        })}
      >
        <Card
          className={cn(
            "px-2 py-1.5 sm:px-4 sm:py-3 text-sm sm:text-base",
            {
              "bg-[#FFB7C5] text-black border border-[#FF98A5] shadow-md": !message.isBot,
              "bg-gradient-to-br from-white to-pink-50 text-black border border-pink-100 shadow-md": message.isBot,
            }
          )}
        >
          {/* Display category badge */}
          {message.category && message.category !== "SELF" && !message.isBot && (
            <div className="flex justify-end mb-1">
              <Badge variant={getCategoryBadgeVariant(message.category)} className="text-[10px] py-0 h-4 flex items-center">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {{
                  PRIVATE: "民間",
                  SELF: "自分",
                  ADMINISTRATIVE: "行政"
                }[message.category] ?? message.category}
              </Badge>
            </div>
          )}


              <div className="prose prose-xs sm:prose-sm break-words font-medium max-w-none w-full">


            {message.isBot && sections ? (
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-[#CC3366] hover:text-[#FF98A5] underline"
                        >
                          {children}
                        </a>
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto w-full">
                        <table className="text-[11px] sm:text-sm border-collapse w-full min-w-[400px]" {...props} />
                      </div>
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-pink-200 px-1 py-0.5 sm:px-2 sm:py-1" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border border-pink-300 bg-pink-50 px-1 py-0.5 sm:px-2 sm:py-1" {...props} />
                    ),
                  }}
                >
                  {sections.mainText}
                </ReactMarkdown>

                {/* Source sections */}
                <div className="space-y-2">
                  {sections.companyDocs && (
                    <MessageSection
                      title="社内文書情報"
                      content={sections.companyDocs}
                      icon={FileText}
                    />
                  )}

                  {sections.onlineInfo && (
                    <MessageSection
                      title="オンラインWeb情報"
                      content={sections.onlineInfo}
                      icon={Globe}
                    />
                  )}
                </div>
              </>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-[#CC3366] hover:text-[#FF98A5] underline"
                      >
                        {children}
                      </a>
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto w-full">
                      <table className="text-[11px] sm:text-sm border-collapse w-full min-w-[400px]" {...props} />
                    </div>
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-pink-200 px-1 py-0.5 sm:px-2 sm:py-1" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-pink-300 bg-pink-50 px-1 py-0.5 sm:px-2 sm:py-1" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-[9px] sm:text-[10px] text-gray-400">
              {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            {message.isBot ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-1 rounded-full"
                onClick={() => onPlayAudio(message.id, message.content)}
                disabled={isPlayingAudio && playingMessageId !== message.id}
              >
                {isPlayingAudio && playingMessageId === message.id ? (
                  <span className="animate-pulse text-xs">■</span>
                ) : (
                  <Volume2 className="h-4 w-4 text-pink-500" />
                )}
          </Button>
            ) : null}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}