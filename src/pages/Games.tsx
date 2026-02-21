import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw } from 'lucide-react';

const CARDS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

interface Card {
  id: number;
  content: string;
  flipped: boolean;
  matched: boolean;
}

export default function Games() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...CARDS, ...CARDS]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        flipped: false,
        matched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setWon(false);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      checkForMatch(newFlipped);
    }
  };

  const checkForMatch = (currentFlipped: number[]) => {
    const [id1, id2] = currentFlipped;
    const match = cards[id1].content === cards[id2].content;

    if (match) {
      const newCards = [...cards];
      newCards[id1].matched = true;
      newCards[id2].matched = true;
      setCards(newCards);
      setFlippedCards([]);
      
      if (newCards.every(c => c.matched)) {
        setWon(true);
      }
    } else {
      setTimeout(() => {
        const newCards = [...cards];
        newCards[id1].flipped = false;
        newCards[id2].flipped = false;
        setCards(newCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Brain className="text-purple-500" /> Memory Match
        </h2>
        <button
          onClick={initializeGame}
          className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-purple-200 transition-colors font-medium"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
        <p className="text-slate-600 mb-4 text-lg">Moves: <span className="font-bold text-slate-800">{moves}</span></p>
        
        {won && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl font-bold text-xl animate-bounce">
            🎉 Congratulations! You won in {moves} moves!
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl text-4xl flex items-center justify-center transition-all transform ${
                card.flipped || card.matched
                  ? 'bg-white border-2 border-purple-500 rotate-0'
                  : 'bg-purple-500 rotate-180'
              }`}
              disabled={card.matched}
            >
              {(card.flipped || card.matched) ? card.content : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
