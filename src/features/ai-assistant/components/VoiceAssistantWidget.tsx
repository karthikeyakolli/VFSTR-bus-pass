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
  CreditCard
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionTaken?: string;
  actionLink?: string;
}

export const VoiceAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Namaskaram! I am Vaani, your VFSTR Transport AI Assistant. You can speak or type to check bus locations, book seats, view passes, or navigate the portal.',
      timestamp: 'Just now',
    },
  ]);

  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Supports Indian English & Telugu keywords

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

  // Intent parsing & action dispatching
  const handleUserQuery = (query: string) => {
    const cleanQuery = query.toLowerCase().trim();

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Rule-based intent analysis
    let responseText = '';
    let actionTaken = '';
    let actionLink = '';

    if (cleanQuery.includes('pass') || cleanQuery.includes('id card') || cleanQuery.includes('qr')) {
      responseText = 'Opening your Digital Bus Pass with the live anti-fraud rolling QR code.';
      actionTaken = 'Navigated to Digital Pass';
      actionLink = '/student/pass';
      navigate('/student/pass');
    } else if (cleanQuery.includes('book') || cleanQuery.includes('seat') || cleanQuery.includes('reserve') || cleanQuery.includes('standing')) {
      responseText = 'Navigating to the 45-Seat & 15-Standing capacity booking engine.';
      actionTaken = 'Navigated to Seat Booking';
      actionLink = '/booking';
      navigate('/booking');
    } else if (cleanQuery.includes('fee') || cleanQuery.includes('cost') || cleanQuery.includes('price') || cleanQuery.includes('slab')) {
      responseText = 'Showing the route fee structure and zone slabs for the current academic year.';
      actionTaken = 'Navigated to Fee Structure';
      actionLink = '/fee-structure';
      navigate('/fee-structure');
    } else if (cleanQuery.includes('route') || cleanQuery.includes('track') || cleanQuery.includes('where is') || cleanQuery.includes('live')) {
      responseText = 'Opening live fleet radar. All 65+ campus buses are actively broadcasting GPS coordinates.';
      actionTaken = 'Navigated to Live Fleet Map';
      actionLink = '/routes';
      navigate('/routes');
    } else if (cleanQuery.includes('sos') || cleanQuery.includes('emergency') || cleanQuery.includes('help me') || cleanQuery.includes('danger')) {
      responseText = 'Emergency SOS triggered! Please stay calm. Campus security and your driver have been alerted.';
      actionTaken = 'Emergency Protocol Alerted';
    } else if (cleanQuery.includes('faculty') || cleanQuery.includes('teacher') || cleanQuery.includes('staff')) {
      responseText = 'Faculty members enjoy priority seating and automated monthly payroll deductions (₹2,200/mo). Taking you to Faculty Portal.';
      actionTaken = 'Navigated to Faculty Portal';
      actionLink = '/faculty';
      navigate('/faculty');
    } else if (cleanQuery.includes('capacity') || cleanQuery.includes('60') || cleanQuery.includes('45')) {
      responseText = 'VFSTR buses operate on a 45-seat physical layout with 15 standing room boarding passes, ensuring a maximum load of 60 passengers per bus.';
    } else {
      responseText = `I received your inquiry: "${query}". You can ask me to book a seat, view your digital pass, check live bus tracking, or view route fee structures.`;
    }

    const assistantMsg: ChatMessage = {
      id: 'asst-' + Date.now(),
      sender: 'assistant',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionTaken,
      actionLink,
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, assistantMsg]);
      speakText(responseText);
    }, 400);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleUserQuery(inputText);
    }
  };

  return (
    <>
      {/* Floating Trigger Pill on bottom right */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-bounce-gentle">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white rounded-full shadow-2xl border-2 border-white/30 backdrop-blur transition-all hover:scale-105 active:scale-95 group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-primary animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-black block leading-none">VFSTR Vaani</span>
              <span className="text-[10px] text-white/80 font-medium leading-none">Voice & Text Copilot</span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300 ml-0.5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}

      {/* Expanded Copilot Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-200">
          <Card className="border-2 border-primary/30 bg-card/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black tracking-tight">VFSTR Vaani</h3>
                    <Badge variant="outline" className="border-white/30 text-white text-[9px] py-0 px-1.5">
                      Bilingual AI
                    </Badge>
                  </div>
                  <p className="text-[11px] text-white/80">Voice Navigation & Fleet Helpdesk</p>
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

            {/* Quick Action Chips */}
            <div className="px-3 py-2 bg-muted/40 border-b border-border/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
              <button
                type="button"
                onClick={() => handleUserQuery('Book a seat')}
                className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 shrink-0 border border-primary/20 flex items-center gap-1"
              >
                <Bus className="w-3 h-3" /> Book Seat (45/60)
              </button>
              <button
                type="button"
                onClick={() => handleUserQuery('Show my bus pass')}
                className="px-2.5 py-1 rounded-full bg-card hover:bg-muted font-bold text-foreground shrink-0 border border-border flex items-center gap-1"
              >
                <CreditCard className="w-3 h-3" /> My Pass
              </button>
              <button
                type="button"
                onClick={() => handleUserQuery('Track live buses')}
                className="px-2.5 py-1 rounded-full bg-card hover:bg-muted font-bold text-foreground shrink-0 border border-border flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" /> Live Radar
              </button>
            </div>

            {/* Messages Chat Flow */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted/80 text-foreground border border-border/80 rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.actionTaken && (
                      <div className="mt-2 pt-2 border-t border-border/40 flex items-center gap-1.5 font-bold text-[10px] text-primary">
                        <Sparkles className="w-3 h-3" />
                        <span>{m.actionTaken}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
                    {m.timestamp}
                  </span>
                </div>
              ))}
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
                  <span>{isListening ? 'Listening to your voice...' : 'Vaani is speaking...'}</span>
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
                placeholder={isListening ? 'Listening...' : 'Ask Vaani or say "Book a seat"...'}
                className="flex-1 bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!inputText.trim()}
                className="h-9 px-3 rounded-xl"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
};
