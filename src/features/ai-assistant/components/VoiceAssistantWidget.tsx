import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Bot, 
  Navigation, 
  Bus, 
  CreditCard,
  Zap,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { generateTransitAiResponse, TransitAction } from '@/services/ai/GroqAiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: TransitAction[];
  latencyMs?: number;
  modelUsed?: string;
  isFallback?: boolean;
}

export const VoiceAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [latestLatency, setLatestLatency] = useState<number | null>(null);
  const [latestModel, setLatestModel] = useState<string>('qwen/qwen3.8-27b');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Namaskaram! I am Vaani, your dynamic AI copilot powered by Groq LPU. Ask me anything about our 71 routes, 45+15 capacity bookings, rolling QR bus passes, fee slabs, or live GPS telemetry.',
      timestamp: 'Just now',
      actions: [
        { label: 'Live Bus Radar', path: '/routes' },
        { label: 'Book Seat (45/60)', path: '/student/booking' },
        { label: 'My Digital Pass', path: '/student/pass' },
      ],
    },
  ]);

  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript.trim()) {
          handleUserQuery(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text to Speech
  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Already running
        }
      } else {
        alert('Voice recognition is not supported in this browser. Please use Chrome/Edge or type your query.');
      }
    }
  };

  // Dynamic AI query handler using Groq LPU
  const handleUserQuery = async (query: string) => {
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      // Build conversational memory history
      const history = [...messages, userMsg].map((m) => ({
        role: m.sender,
        content: m.text,
      }));

      // Call dynamic Groq AI Engine
      const aiResponse = await generateTransitAiResponse(history);

      const assistantMsg: ChatMessage = {
        id: 'asst-' + Date.now(),
        sender: 'assistant',
        text: aiResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: aiResponse.actions,
        latencyMs: aiResponse.latencyMs,
        modelUsed: aiResponse.modelUsed,
        isFallback: aiResponse.isFallback,
      };

      setLatestLatency(aiResponse.latencyMs);
      setLatestModel(aiResponse.modelUsed);
      setMessages((prev) => [...prev, assistantMsg]);
      speakText(aiResponse.cleanSpeechText);
    } catch (err) {
      console.error('AI assistant error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'asst-' + Date.now(),
        sender: 'assistant',
        text: 'I am temporarily experiencing connection delays. You can still navigate directly to Live Routes or your Digital Pass below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'View Live Routes', path: '/routes' },
          { label: 'Digital Pass', path: '/student/pass' },
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleUserQuery(inputText);
    }
  };

  const executeAction = (action: TransitAction) => {
    if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <>
      {/* Floating Trigger Pill on bottom right */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-bounce-gentle">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary via-indigo-600 to-violet-600 hover:from-primary-hover hover:to-indigo-700 text-white rounded-full shadow-2xl border-2 border-white/30 backdrop-blur transition-all hover:scale-105 active:scale-95 group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-primary animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black block leading-none">VFSTR Vaani AI</span>
                <span className="text-[9px] bg-amber-400/20 text-amber-200 border border-amber-300/30 rounded px-1 font-mono font-bold leading-none">Groq LPU</span>
              </div>
              <span className="text-[10px] text-white/80 font-medium leading-none">Dynamic Transit Copilot</span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300 ml-0.5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}

      {/* Expanded Dynamic Copilot Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-200">
          <Card className="border-2 border-primary/30 bg-card/95 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[560px]">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary via-indigo-600 to-violet-700 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black tracking-tight">VFSTR Vaani AI</h3>
                    <Badge variant="outline" className="border-white/30 bg-white/10 text-white text-[9px] py-0 px-1.5 font-mono flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                      Groq LPU
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/80 mt-0.5">
                    <span>{latestModel.includes('/') ? latestModel.split('/')[1] : latestModel}</span>
                    {latestLatency !== null && (
                      <span className="flex items-center gap-1 text-emerald-200 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {latestLatency}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  title={speechEnabled ? 'Mute Voice Output' : 'Enable Voice Output'}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-muted/40 border-b border-border/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
              <button
                type="button"
                onClick={() => handleUserQuery('Book a seat on Route 12')}
                className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 shrink-0 border border-primary/20 flex items-center gap-1 transition-colors"
              >
                <Bus className="w-3 h-3" /> Book 45/60 Seat
              </button>
              <button
                type="button"
                onClick={() => handleUserQuery('Show my bus pass with dynamic QR')}
                className="px-2.5 py-1 rounded-full bg-card hover:bg-muted font-bold text-foreground shrink-0 border border-border flex items-center gap-1 transition-colors"
              >
                <CreditCard className="w-3 h-3 text-indigo-500" /> Digital Pass
              </button>
              <button
                type="button"
                onClick={() => handleUserQuery('Track live bus locations')}
                className="px-2.5 py-1 rounded-full bg-card hover:bg-muted font-bold text-foreground shrink-0 border border-border flex items-center gap-1 transition-colors"
              >
                <Navigation className="w-3 h-3 text-emerald-500" /> Live Radar
              </button>
              <button
                type="button"
                onClick={() => handleUserQuery('What are the fee zones and slabs?')}
                className="px-2.5 py-1 rounded-full bg-card hover:bg-muted font-bold text-foreground shrink-0 border border-border flex items-center gap-1 transition-colors"
              >
                Fee Slabs
              </button>
            </div>

            {/* Messages Chat Flow */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground rounded-br-none'
                        : 'bg-muted/80 text-foreground border border-border/80 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Dynamic Action Buttons inside message bubble */}
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                        {m.actions.map((act, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => executeAction(act)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-1 text-[9px] text-muted-foreground">
                    <span>{m.timestamp}</span>
                    {m.latencyMs !== undefined && (
                      <span className="flex items-center gap-0.5 font-mono text-emerald-600 dark:text-emerald-400">
                        <Zap className="w-2.5 h-2.5" />
                        {m.latencyMs}ms
                      </span>
                    )}
                    {m.isFallback && (
                      <span className="text-amber-500 font-medium">Local Engine</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Dynamic Thinking Indicator */}
              {isThinking && (
                <div className="flex flex-col items-start animate-in fade-in duration-150">
                  <div className="bg-muted/80 border border-primary/20 rounded-2xl rounded-bl-none px-3.5 py-2.5 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      Vaani is thinking on Groq LPU...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Audio Waveform Indicator during Speech/Listening */}
            {(isListening || isSpeaking) && (
              <div className="px-4 py-2 bg-primary/10 border-t border-primary/20 flex items-center justify-between text-xs text-primary font-bold animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-primary rounded-full animate-bounce" />
                    <span className="w-1 h-5 bg-primary rounded-full animate-bounce delay-75" />
                    <span className="w-1 h-2 bg-primary rounded-full animate-bounce delay-150" />
                  </div>
                  <span>{isListening ? 'Listening to your voice...' : 'Vaani is responding...'}</span>
                </div>
                <Badge variant="outline" className="border-primary text-primary text-[10px]">
                  {isListening ? 'Speak Now' : 'Voice Active'}
                </Badge>
              </div>
            )}

            {/* Input Bar with Voice Toggle */}
            <form onSubmit={handleSendText} className="p-3 bg-card border-t border-border flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all shadow-sm ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-500/20'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-primary" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Ask Vaani or type a route/query...'}
                className="flex-1 bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={isThinking}
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!inputText.trim() || isThinking}
                className="h-9 px-3 rounded-xl flex items-center gap-1"
              >
                {isThinking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
};
