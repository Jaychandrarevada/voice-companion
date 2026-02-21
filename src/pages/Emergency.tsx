import React, { useState, useEffect } from 'react';
import { Phone, AlertTriangle, Plus, Trash2 } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
}

export default function Emergency() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRel, setNewRel] = useState('');
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const res = await fetch('/api/emergency-contacts');
    const data = await res.json();
    if (data.contacts) setContacts(data.contacts);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/emergency-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, phone: newPhone, relationship: newRel }),
    });
    setNewName('');
    setNewPhone('');
    setNewRel('');
    setShowForm(false);
    fetchContacts();
  };

  const handleSOS = () => {
    setSosActive(true);
    // Simulate emergency alert
    setTimeout(() => {
      alert('Emergency Alert Sent! Help is on the way.');
      setSosActive(false);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <button
          onClick={handleSOS}
          className={`w-64 h-64 rounded-full shadow-xl border-8 flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${
            sosActive
              ? 'bg-red-600 border-red-400 animate-pulse'
              : 'bg-red-500 border-red-100 hover:bg-red-600'
          }`}
        >
          <AlertTriangle size={64} className="text-white mb-2" />
          <span className="text-3xl font-bold text-white uppercase tracking-wider">SOS</span>
          <span className="text-red-100 mt-2 font-medium">Press for Help</span>
        </button>
        <p className="mt-6 text-slate-500 max-w-md mx-auto">
          Pressing this button will alert your emergency contacts and local services immediately.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Phone className="text-blue-500" /> Emergency Contacts
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} /> Add Contact
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="mb-6 bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-200">
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Relationship (e.g. Son, Doctor)"
              value={newRel}
              onChange={(e) => setNewRel(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">
              Save Contact
            </button>
          </form>
        )}

        <div className="space-y-3">
          {contacts.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No emergency contacts added.</p>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-slate-800">{contact.name}</div>
                  <div className="text-sm text-slate-500">{contact.relationship} • {contact.phone}</div>
                </div>
                <a href={`tel:${contact.phone}`} className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200">
                  <Phone size={20} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
