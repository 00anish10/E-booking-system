import { useState, useMemo, useEffect } from "react";
import { X, Search as SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { booksData } from "@/data/books";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Clear search EVERY time modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();

    return booksData
      .filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.category.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-4 bg-[hsl(40,20%,97%)] rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* SEARCH BAR */}
            <div className="p-4 border-b border-[hsl(40,15%,85%)]">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(230,15%,45%)]" />
                <input
                  type="text"
                  placeholder="Search books by title, author, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-transparent text-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[hsl(40,15%,90%)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* RESULTS */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!searchQuery.trim() ? (
                <div className="p-8 text-center text-[hsl(230,15%,45%)]">
                  Start typing to search for books…
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((book) => (
                    <Link
                      key={book.id}
                      to={`/book/${book.id}`}
                      onClick={handleClose}
                      className="flex gap-4 p-3 rounded-lg hover:bg-[hsl(40,15%,90%)]"
                    >
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{book.title}</h3>
                        <p className="text-sm opacity-70 truncate">
                          {book.author}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-[hsl(230,45%,25%)] text-white">
                            {book.category}
                          </span>
                          <span className="font-semibold">
                            ${book.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="opacity-70 mb-4">
                    No books found for "{searchQuery}"
                  </p>
                  <Link
                    to="/catalog"
                    onClick={handleClose}
                    className="px-6 py-2 rounded-lg bg-[hsl(230,45%,25%)] text-white font-medium"
                  >
                    Browse All Books
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
