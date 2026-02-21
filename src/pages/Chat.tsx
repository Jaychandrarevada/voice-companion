import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const { isListening, transcript, startListening, stopListening, speak, isSpeaking, supported } = useVoice();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  useEffect(() => {
    // Load chat history
    fetch('/api/chat/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setMessages(data.history);
      });
  }, []);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Auto-send when voice input finishes
  useEffect(() => {
    if (!isListening && transcript) {
      handleSend(transcript);
    }
  }, [isListening, transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageContent = typeof text === 'string' ? text : input;
    if (!messageContent.trim()) return;

    const userMessage = messageContent;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Save user message
    await fetch('/api/chat/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content: userMessage }),
    });

    try {
      const model = 'gemini-2.5-flash-latest'; // Use a fast model for chat
      const systemInstruction = `You are EchoCare, a supportive and empathetic companion for an elderly person named ${user?.name}. Keep responses concise, warm, and easy to understand. Avoid jargon. Be patient and encouraging.`;
      
      const chat = ai.chats.create({
        model: model,
        config: { systemInstruction },
        history: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      });

      const result = await chat.sendMessage({ message: userMessage });
      const responseText = result.text || "I'm sorry, I didn't catch that.";

      setMessages((prev) => [...prev, { role: 'assistant', content: responseText }]);
      speak(responseText);

      // Save assistant message
      await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: responseText }),
      });

    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold">Chat with Echo</h2>
        {isSpeaking && <span className="animate-pulse text-sm font-medium">Speaking...</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <span className="text-slate-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!supported}
            title={supported ? "Toggle voice input" : "Voice input not supported in this browser"}
            className={`p-4 rounded-full transition-colors ${
              !supported ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
              isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={supported ? "Type or say something..." : "Type something..."}
            className="flex-1 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
          />
          
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
