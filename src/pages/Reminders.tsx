import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Check, Trash2, Calendar, Clock } from 'lucide-react';

interface Reminder {
  id: number;
  title: string;
  time: string; // ISO string
  recurring: boolean;
  completed: boolean;
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    const res = await fetch('/api/reminders');
    const data = await res.json();
    if (data.reminders) setReminders(data.reminders);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTime) return;

    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, time: newTime, recurring: false }),
    });

    setNewTitle('');
    setNewTime('');
    setShowForm(false);
    fetchReminders();
  };

  const handleComplete = async (id: number) => {
    await fetch(`/api/reminders/${id}/complete`, { method: 'PUT' });
    fetchReminders();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Reminders</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} /> Add New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">What do you need to remember?</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Take heart medication"
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">When?</label>
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
            <p>No reminders set yet.</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border ${
                reminder.completed ? 'border-green-200 bg-green-50' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => !reminder.completed && handleComplete(reminder.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    reminder.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 hover:border-blue-500'
                  }`}
                >
                  {reminder.completed && <Check size={16} />}
                </button>
                <div>
                  <h3 className={`text-lg font-medium ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {reminder.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Clock size={14} />
                    {format(new Date(reminder.time), 'PPp')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
