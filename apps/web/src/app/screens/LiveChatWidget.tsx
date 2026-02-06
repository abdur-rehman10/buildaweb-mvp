import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';

interface LiveChatWidgetProps {
  onClose: () => void;
}

export function LiveChatWidget({ onClose }: LiveChatWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages] = useState([
    {
      id: '1',
      sender: 'agent',
      text: 'Hi! I\'m Sarah from Buildaweb support. How can I help you today?',
      time: '2:35 PM',
    },
    {
      id: '2',
      sender: 'user',
      text: 'Hi! I\'m having trouble connecting my custom domain.',
      time: '2:36 PM',
    },
    {
      id: '3',
      sender: 'agent',
      text: 'I\'d be happy to help you with that. Can you tell me which domain you\'re trying to connect?',
      time: '2:36 PM',
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message
      setMessage('');
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsMinimized(false)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold">Live Support</div>
            <div className="text-xs opacity-90">Typically replies in minutes</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`rounded-lg p-3 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                {msg.text}
              </div>
              <div className="text-xs text-muted-foreground mt-1 px-1">{msg.time}</div>
            </div>
          </div>
        ))}

        {/* Agent Typing Indicator */}
        <div className="flex justify-start">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex gap-1">
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={handleSend} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          We typically reply in under 5 minutes
        </p>
      </div>
    </Card>
  );
}
