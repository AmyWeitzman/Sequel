'use client';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-indigo-100 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900">📖 How to Play Sequel</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 text-2xl leading-none px-2">
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-gray-800">
          <section>
            <h3 className="font-semibold text-lg mb-1 text-gray-900">🎯 Objective</h3>
            <p>
              Sequel is a themed take on the board game Sequence. The 10×10 board holds 48
              items, each appearing twice, reshuffled into new positions every game. Play a
              matching card from your hand onto the board to place your colored chip, and
              race to form sequences of 5 chips in a row — horizontally, vertically, or
              diagonally.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-1 text-gray-900">🏆 Winning</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>2 players:</strong> 7 cards in hand, first to complete 2 sequences wins.</li>
              <li><strong>3 players:</strong> 6 cards in hand, first to complete 1 sequence wins.</li>
            </ul>
            <p className="mt-2 text-sm text-gray-600">
              The 4 corners are free spaces — everyone treats them as already filled. Two of
              your sequences may share at most 1 board cell; sharing more doesn&apos;t count as a
              second sequence.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-1 text-gray-900">🃏 Wildcards</h3>
            <p>
              Every theme&apos;s 104-card deck includes 8 wildcards: 4 that place a chip on{' '}
              <em>any</em> open cell, and 4 that remove an opponent&apos;s chip from the board
              (never your own, and never a chip that&apos;s already part of a completed
              sequence).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-1 text-gray-900">💀 Dead cards</h3>
            <p>
              If a card in your hand can never be legally played — both of its matching board
              spots are already occupied — it&apos;s dead. Discard it on your turn for a fresh
              card; this doesn&apos;t use up your turn, so you can still play normally
              afterward.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">🎨 Themes</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Emoji Match</strong> — play the identical emoji shown on your card.</p>
              <p><strong>Space</strong> — real planets, moons, stars, and sci-fi vocabulary, matched identically.</p>
              <p>
                <strong>Noun/Adjective</strong> — each adjective card names its 2 matching
                board nouns right on the card (e.g. &ldquo;Fluffy — Cloud · Sheep&rdquo;), giving you
                4 valid cells to choose from (2 nouns × 2 board copies each).
              </p>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-indigo-100 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
