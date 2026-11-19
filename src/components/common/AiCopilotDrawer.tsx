import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Key, 
  RotateCcw, 
  Copy, 
  Check, 
  Compass, 
  Microscope, 
  Trash2, 
  ChevronDown, 
  Plus, 
  MessageSquare, 
  Square,
  AlertCircle,
  History,
  Zap
} from 'lucide-react';
import { 
  GROQ_MODELS, 
  getStoredAiModel, 
  setStoredAiModel, 
  AiModelItem 
} from '../../services/groqService';
import { 
  streamChatMessage, 
  fetchChatStatus, 
  fetchChatConversations, 
  fetchConversationMessages, 
  deleteChatConversation,
  ChatConversationItem,
  ChatStatusResponse
} from '../../services/apiService';
import { useDetection } from '../../context/DetectionContext';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

type ChatMode = 'auto' | 'general' | 'forensic';

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const { currentAnalysis } = useDetection();
  const [chatMode, setChatMode] = useState<ChatMode>('auto');
  const [activeModel, setActiveModel] = useState<string>(() => getStoredAiModel());
  const [conversationId, setConversationId] = useState<string>(() => {
    return localStorage.getItem('aegis_active_conv_id') || `conv_${Date.now()}`;
  });
  
  // History panel state
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);
  const [conversationsList, setConversationsList] = useState<ChatConversationItem[]>([]);

  // Messages in active conversation
  const [messages, setMessages] = useState<Array<{ role: 'system' | 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hello! I am your **Aegis AI Assistant**, powered by **Groq LPUs** & **GPT-OSS 120B** ⚡\n\nI am a full general-purpose intelligent AI (similar to ChatGPT and Flipkart AI).\n\nAsk me **ANY** question:\n- 💻 **Programming & Algorithms**: Python, Java, C++, JavaScript, SQL, DSA, debugging\n- 🔬 **Science & Math**: Calculus, deep learning, physics, logical puzzles\n- 🌐 **General Knowledge**: History, creative writing, explanations, reasoning\n- 🔍 **Deepfake Media Forensics**: 2D FFT spectral harmonics, PRNU noise, Wav2Lip desynchronization for **${currentAnalysis.video.filename}**.\n\n*How can I assist you today?*`
    }
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [backendStatus, setBackendStatus] = useState<ChatStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCaseIdRef = useRef<string>(currentAnalysis.id);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('aegis_active_conv_id', conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (isOpen) {
      loadBackendStatus();
      loadConversations();
    }
  }, [isOpen]);

  const loadBackendStatus = async () => {
    const status = await fetchChatStatus();
    if (status) {
      setBackendStatus(status);
    }
  };

  const loadConversations = async () => {
    const convs = await fetchChatConversations();
    setConversationsList(convs);
  };

  // When active case changes, notify chat context
  useEffect(() => {
    if (prevCaseIdRef.current !== currentAnalysis.id) {
      prevCaseIdRef.current = currentAnalysis.id;
      setMessages(prev => [
        ...prev,
        {
          role: 'system',
          content: `📌 Active evidence case loaded: **${currentAnalysis.video.filename}** (Verdict: **${currentAnalysis.verdict}**, Deepfake Probability: **${currentAnalysis.overallScore}%**). Forensic context ready.`
        }
      ]);
    }
  }, [currentAnalysis.id, currentAnalysis.video.filename, currentAnalysis.verdict, currentAnalysis.overallScore]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, isOpen]);

  if (!isOpen) return null;

  const currentModelMeta = GROQ_MODELS.find(m => m.id === activeModel) || GROQ_MODELS[0];
  const isGroqConfigured = backendStatus?.configured;

  const handleSelectModel = (modelId: string) => {
    setActiveModel(modelId);
    setStoredAiModel(modelId);
    setShowModelDropdown(false);
    setErrorMessage(null);
  };

  const handleStartNewChat = () => {
    const newId = `conv_${Date.now()}`;
    setConversationId(newId);
    setMessages([
      {
        role: 'assistant',
        content: `New conversation started on **${currentModelMeta.name.split('(')[0].trim()}**. Ask any coding, math, science, general question or forensic investigation!`
      }
    ]);
    setShowHistoryPanel(false);
    setErrorMessage(null);
  };

  const handleSelectConversation = async (convId: string) => {
    setConversationId(convId);
    setShowHistoryPanel(false);
    setErrorMessage(null);
    const dbMsgs = await fetchConversationMessages(convId);
    if (dbMsgs.length > 0) {
      setMessages(dbMsgs.map(m => ({ role: m.role, content: m.content })));
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    await deleteChatConversation(convId);
    if (conversationId === convId) {
      handleStartNewChat();
    }
    loadConversations();
  };

  const handleSend = async (userText = input) => {
    const trimmed = userText.trim();
    if (!trimmed || isStreaming) return;

    setErrorMessage(null);
    const userMsg = { role: 'user' as const, content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    const assistantMsgIndex = newMessages.length;
    setMessages([...newMessages, { role: 'assistant', content: '' }]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedContent = '';

    await streamChatMessage({
      message: trimmed,
      messages: newMessages,
      conversation_id: conversationId,
      mode: chatMode,
      model: activeModel,
      temperature: 0.5,
      max_tokens: 2048,
      case_dossier: chatMode === 'general' ? undefined : currentAnalysis,
      abortSignal: controller.signal,
      onToken: (token) => {
        accumulatedContent += token;
        setMessages(prev => {
          const copy = [...prev];
          if (copy[assistantMsgIndex]) {
            copy[assistantMsgIndex] = {
              ...copy[assistantMsgIndex],
              content: accumulatedContent
            };
          }
          return copy;
        });
      },
      onDone: (meta) => {
        setIsStreaming(false);
        abortControllerRef.current = null;
        if (meta.conversation_id) {
          setConversationId(meta.conversation_id);
        }
        loadConversations();
      },
      onError: (errMsg) => {
        setIsStreaming(false);
        abortControllerRef.current = null;
        setErrorMessage(errMsg);
        setMessages(prev => {
          const copy = [...prev];
          if (copy[assistantMsgIndex]) {
            copy[assistantMsgIndex] = {
              ...copy[assistantMsgIndex],
              content: accumulatedContent ? accumulatedContent : `⚠️ ${errMsg}`
            };
          }
          return copy;
        });
      }
    });
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = async () => {
    if (isStreaming || messages.length < 2) return;
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const lastUserText = messages[lastUserIndex].content;
    const truncated = messages.slice(0, lastUserIndex);
    setMessages(truncated);
    handleSend(lastUserText);
  };

  const suggestedPrompts = [
    'Explain binary search in Java with code and complexity',
    'Write a quicksort implementation in Python',
    'What went wrong with my deepfake detection project?',
    'What is photosynthesis?',
    'Explain 2D Fourier (FFT) checkerboards in deepfakes',
    'Is this video admissible in court under FRE 901?',
  ];

  // Markdown and code block formatter
  const renderMessageContent = (content: string, isLastAssistant: boolean) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return (
      <>
        {parts.map((part, pIdx) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const lines = part.slice(3, -3).trim().split('\n');
            const lang = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
            const codeText = lang ? lines.slice(1).join('\n') : lines.join('\n');
            return (
              <div key={pIdx} className="my-2.5 rounded-xl bg-[#0D0B10] border border-[#363042] overflow-hidden text-xs">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#17151C] border-b border-[#363042] text-[10px] text-[#A39AAA] font-mono">
                  <span>{lang || 'code'}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(codeText)}
                    className="hover:text-[#F5F0FA] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-[#D6B8E8] font-mono leading-relaxed">
                  <code>{codeText}</code>
                </pre>
              </div>
            );
          }

          const lines = part.split('\n');
          return (
            <span key={pIdx}>
              {lines.map((line, lIdx) => {
                if (line.startsWith('### ')) {
                  return (
                    <span key={lIdx} className="block text-sm font-bold text-[#F5F0FA] mt-2.5 mb-1">
                      {line.replace('### ', '')}
                    </span>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <span key={lIdx} className="block text-base font-bold text-[#F5F0FA] mt-3 mb-1.5">
                      {line.replace('## ', '')}
                    </span>
                  );
                }
                if (line.startsWith('> ')) {
                  return (
                    <span key={lIdx} className="block pl-3 border-l-2 border-[#FFA502] text-[#FFA502] text-[11px] my-1 italic">
                      {line.replace('> ', '')}
                    </span>
                  );
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <span key={lIdx} className="block pl-3 text-[#E2DCED] my-0.5 relative before:content-['•'] before:absolute before:left-0 before:text-[#B58AFF]">
                      {line.substring(2)}
                    </span>
                  );
                }
                return (
                  <span key={lIdx}>
                    {line}
                    {lIdx < lines.length - 1 && <br />}
                  </span>
                );
              })}
            </span>
          );
        })}
        {isStreaming && isLastAssistant && (
          <span className="inline-block w-2 h-4 ml-1 bg-[#B58AFF] animate-pulse align-middle" />
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] bg-[#1E1B24] border-l border-[#363042] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#363042] flex items-center justify-between bg-[#24212B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/50 flex items-center justify-center text-[#B58AFF] shadow-[0_0_15px_rgba(181,138,255,0.2)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 relative">
              <h3 className="text-sm font-bold text-[#F5F0FA]">Aegis Groq AI</h3>
              
              {/* Groq Model Switcher */}
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors bg-[#3D2452] text-[#D6B8E8] border border-[#B58AFF]/40 hover:border-[#B58AFF]"
                title="Switch Groq LPU Model"
              >
                <Zap className="w-3 h-3 text-[#B58AFF]" />
                <span>{currentModelMeta.badge}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showModelDropdown && (
                <div className="absolute top-7 left-24 z-50 w-80 bg-[#17151C] border border-[#363042] rounded-2xl p-2 shadow-2xl space-y-1 animate-in fade-in">
                  <div className="px-2 pt-1 pb-1 text-[10px] font-bold text-[#B58AFF] uppercase tracking-wider flex items-center justify-between">
                    <span>Groq Models API (Verified)</span>
                    <span className="text-[9px] text-[#2ED573]">LPU Hardware</span>
                  </div>
                  {GROQ_MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectModel(m.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        activeModel === m.id 
                          ? 'bg-[#B58AFF]/20 text-[#B58AFF] font-bold' 
                          : 'text-[#F5F0FA] hover:bg-[#24212B]'
                      }`}
                    >
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          <span>{m.name.split('(')[0].trim()}</span>
                          {m.is_primary && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#B58AFF]/20 text-[#B58AFF] border border-[#B58AFF]/40">Primary</span>
                          )}
                          {m.is_fallback && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00D2D3]/20 text-[#00D2D3] border border-[#00D2D3]/40">Fallback</span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#A39AAA] font-normal line-clamp-1">{m.description}</div>
                      </div>
                      {activeModel === m.id && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-[11px] text-[#A39AAA] flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isGroqConfigured ? 'bg-[#2ED573]' : 'bg-[#FFA502]'}`} />
              <span>{isGroqConfigured ? 'Groq LPU Connected' : 'Groq Key Pending'}</span>
              <span>•</span>
              <span className="truncate max-w-[180px]">Case: {currentAnalysis.video.filename}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showHistoryPanel 
                ? 'bg-[#B58AFF]/20 border-[#B58AFF] text-[#B58AFF]' 
                : 'border-[#363042] bg-[#17151C] text-[#A39AAA] hover:text-[#F5F0FA]'
            }`}
            title="Chat History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={handleStartNewChat}
            className="p-1.5 rounded-lg border border-[#363042] bg-[#17151C] text-[#A39AAA] hover:text-[#B58AFF] transition-colors cursor-pointer"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-[#363042] bg-[#17151C] text-[#A39AAA] hover:text-[#F5F0FA] transition-colors cursor-pointer"
            title="Groq API Status & Key Settings"
          >
            <Key className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A39AAA] hover:text-[#F5F0FA] hover:bg-[#17151C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* History Slide-out Panel */}
      {showHistoryPanel && (
        <div className="bg-[#17151C] border-b border-[#363042] p-3 max-h-56 overflow-y-auto space-y-1.5 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#A39AAA] uppercase tracking-wider px-2">
            <span>Conversations (SQLite Memory)</span>
            <button
              onClick={handleStartNewChat}
              className="text-[#B58AFF] hover:underline flex items-center gap-1 cursor-pointer font-normal"
            >
              <Plus className="w-3 h-3" /> New Chat
            </button>
          </div>
          {conversationsList.length === 0 ? (
            <div className="text-xs text-[#A39AAA] text-center py-3">No saved conversations yet.</div>
          ) : (
            conversationsList.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectConversation(c.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  conversationId === c.id 
                    ? 'bg-[#2A1B38] text-[#F5F0FA] border border-[#B58AFF]/40' 
                    : 'text-[#A39AAA] hover:bg-[#24212B] hover:text-[#F5F0FA]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#B58AFF]" />
                  <span className="truncate">{c.title || 'Conversation'}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#A39AAA]">{c.message_count} msgs</span>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    className="hover:text-[#FF5370] cursor-pointer"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="px-4 py-2 bg-[#1C1922] border-b border-[#363042] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-[#17151C] p-1 rounded-xl border border-[#363042]/70 text-[11px]">
          <button
            onClick={() => setChatMode('auto')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              chatMode === 'auto'
                ? 'bg-[#B58AFF] text-[#17151C] font-bold shadow-sm'
                : 'text-[#A39AAA] hover:text-[#F5F0FA]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Auto
          </button>

          <button
            onClick={() => setChatMode('general')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              chatMode === 'general'
                ? 'bg-[#B58AFF] text-[#17151C] font-bold shadow-sm'
                : 'text-[#A39AAA] hover:text-[#F5F0FA]'
            }`}
          >
            <Compass className="w-3 h-3" />
            General (ChatGPT)
          </button>

          <button
            onClick={() => setChatMode('forensic')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              chatMode === 'forensic'
                ? 'bg-[#B58AFF] text-[#17151C] font-bold shadow-sm'
                : 'text-[#A39AAA] hover:text-[#F5F0FA]'
            }`}
          >
            <Microscope className="w-3 h-3" />
            Forensics
          </button>
        </div>

        <span className="text-[10px] text-[#A39AAA] font-mono hidden sm:inline">
          {currentModelMeta.badge} • Groq Async SSE
        </span>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div key={i} className="flex justify-center my-2">
                <div className="max-w-[90%] px-3 py-1.5 rounded-xl bg-[#2A1B38]/60 border border-[#B58AFF]/30 text-[11px] text-[#D6B8E8] text-center">
                  {msg.content}
                </div>
              </div>
            );
          }

          const isUser = msg.role === 'user';
          const isLastAssistant = !isUser && i === messages.length - 1;

          return (
            <div
              key={i}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 leading-relaxed ${
                  isUser
                    ? 'bg-[#B58AFF] text-[#17151C] font-medium rounded-br-none shadow-[0_2px_12px_rgba(181,138,255,0.2)]'
                    : 'bg-[#24212B] text-[#F5F0FA] border border-[#363042] rounded-bl-none shadow-md'
                }`}
              >
                <div className="space-y-1">
                  {renderMessageContent(msg.content, isLastAssistant)}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#A39AAA]">
                <span>{isUser ? 'You' : `${currentModelMeta.badge}`}</span>
                <button
                  onClick={() => handleCopyMessage(msg.content, i)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#F5F0FA] flex items-center gap-0.5 cursor-pointer"
                  title="Copy message"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-3 h-3 text-[#2ED573]" />
                      <span className="text-[#2ED573]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#24212B] border border-[#363042] text-[#B58AFF] text-xs">
            <Bot className="w-4 h-4 animate-bounce" />
            <span className="font-mono">Streaming response from Groq ({currentModelMeta.name.split('(')[0]})...</span>
            <button
              onClick={handleStopStream}
              className="ml-auto flex items-center gap-1 text-[11px] px-2 py-0.5 bg-[#FF5370]/20 text-[#FF5370] rounded-lg hover:bg-[#FF5370]/30 transition-colors cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" /> Stop
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FF5370]/10 border border-[#FF5370]/30 text-[#FF5370] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold">Groq Service Notice</div>
              <div className="text-[11px] mt-0.5 opacity-90">{errorMessage}</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="p-3 border-t border-[#363042]/70 bg-[#24212B]/40 overflow-x-auto no-scrollbar flex items-center gap-2">
        {suggestedPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isStreaming}
            className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#17151C] border border-[#363042] text-[#D6B8E8] hover:border-[#B58AFF]/50 hover:text-[#F5F0FA] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Field & Controls */}
      <div className="p-3 sm:p-4 border-t border-[#363042] bg-[#24212B]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              rows={2}
              placeholder={
                chatMode === 'general'
                  ? `Ask anything! Python, Java, Math, Science, Everyday reasoning...`
                  : chatMode === 'forensic'
                  ? 'Ask about 2D FFT, Wav2Lip, FRE 901, or active case findings...'
                  : `Ask any question or investigate ${currentAnalysis.video.filename}...`
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isStreaming}
              className="w-full bg-[#17151C] border border-[#363042] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F0FA] placeholder-[#A39AAA] focus:outline-none focus:border-[#B58AFF] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            {messages.length > 2 && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isStreaming}
                title="Regenerate last response"
                className="p-2 rounded-xl bg-[#17151C] border border-[#363042] text-[#A39AAA] hover:text-[#F5F0FA] disabled:opacity-50 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStream}
                className="p-3 rounded-xl bg-[#FF5370] text-[#17151C] hover:bg-[#FF6B8B] transition-all cursor-pointer shadow-[0_0_12px_rgba(255,83,112,0.3)]"
                title="Stop Generating"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="p-3 rounded-xl bg-[#B58AFF] hover:bg-[#C7A3FF] text-[#17151C] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_0_12px_rgba(181,138,255,0.3)]"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

    </div>
  );
};
