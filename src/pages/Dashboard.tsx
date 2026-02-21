import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { MessageCircle, Bell, AlertCircle, Brain, Sun, Cloud } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { startListening, isListening, speak } = useVoice();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleVoiceCommand = () => {
    if (isListening) return;
    speak("I'm listening. How can I help you today?");
    startListening();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold mb-2">{greeting}, {user?.name.split(' ')[0]}!</h2>
            <p className="text-blue-100 text-lg">How are you feeling today?</p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-3xl font-mono font-bold">{format(new Date(), 'h:mm a')}</div>
            <div className="text-blue-100">{format(new Date(), 'EEEE, MMMM do')}</div>
          </div>
        </div>
      </section>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/chat" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center group">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <MessageCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Talk to Echo</h3>
          <p className="text-slate-500 mt-2">Have a friendly chat or ask questions</p>
        </Link>

        <Link to="/reminders" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center group">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
            <Bell size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Reminders</h3>
          <p className="text-slate-500 mt-2">Check your medication and schedule</p>
        </Link>

        <Link to="/emergency" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center group">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Emergency Help</h3>
          <p className="text-slate-500 mt-2">Get assistance immediately</p>
        </Link>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sun className="text-orange-500" /> Daily Tip
          </h3>
          <p className="text-slate-600 text-lg leading-relaxed">
            Remember to drink plenty of water today. Staying hydrated helps keep your energy levels up!
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Brain className="text-purple-500" /> Brain Exercise
          </h3>
          <p className="text-slate-600 mb-4">Challenge yourself with a quick memory game.</p>
          <button className="bg-purple-100 text-purple-700 px-6 py-2 rounded-full font-medium hover:bg-purple-200 transition-colors w-full sm:w-auto">
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
