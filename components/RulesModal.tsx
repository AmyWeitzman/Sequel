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
              Sequel is a digital version of the board game Sequence. The 10×10 board holds 48
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
            <p className="mt-2">
              The 4 corners are free spaces. That means
              a line of 5 running through a corner only needs 4 chips you actually place. Two of
              your sequences may share at most 1 board cell; sharing more doesn&apos;t count as a
              second sequence.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-1 text-gray-900">🃏 Wildcards</h3>
            <p>
              Every deck includes 8 wildcards: 4 <strong>Add</strong> cards let you put a chip
              on <em>any</em> open cell. 4 <strong>Remove</strong> cards let you take an
              opponent&apos;s chip off a cell they&apos;ve played on, clearing it back to empty
              (you can&apos;t target your own chip, or one that&apos;s already part of a
              completed sequence).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-1 text-gray-900">💀 Dead cards</h3>
            <p>
              If a card in your hand can never be legally played — both of its matching board
              spots are already occupied — it&apos;s dead. Discard it on your turn for a fresh
              card; this doesn&apos;t use up your turn, so you can still play normally
              afterward. Wildcards are never dead — a Remove card just waits in your hand until
              there&apos;s a chip worth taking.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">🎨 Themes</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Emoji</strong> — everyday emoji icons.</p>
              <p><strong>Space</strong> — planets, moons, and other space imagery.</p>
              <p>
                <strong>Adjectives</strong> — nouns fill the board, adjectives fill your hand;
                each adjective card lists its 2 matching nouns right on the card (e.g.
                &ldquo;Fluffy — Cloud · Sheep&rdquo;).
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
