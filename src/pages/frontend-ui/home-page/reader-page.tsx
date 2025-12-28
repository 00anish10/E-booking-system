import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  Settings,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Lock,
  ShoppingCart,
} from "lucide-react";
import { booksData } from "@/data/books";
import { useCart } from "@/contexts/cart-context";

const ReaderPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const { purchasedBooks, addToCart } = useCart();

  const book = booksData.find((b) => b.id === bookId);
  const isPurchased = book && purchasedBooks.includes(book.id);

  const freePages = 5;
  const totalPages = book?.pages || 300;
  const maxReadablePage = isPurchased ? totalPages : freePages;

  useEffect(() => {
    const savedTheme = localStorage.getItem("reader-theme");
    const savedFont = localStorage.getItem("reader-font");
    if (savedTheme) setIsDarkMode(savedTheme === "dark");
    if (savedFont) setFontSize(Number(savedFont));
  }, []);

  useEffect(() => {
    localStorage.setItem("reader-theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("reader-font", String(fontSize));
  }, [isDarkMode, fontSize]);

  const isPreviewLocked = !isPurchased && currentPage > freePages;

  const previewContent = `${book?.description || ""}

This is a preview of the book.

Only the first ${freePages} pages are free. Purchase to unlock all ${totalPages} pages.`;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-neutral-950" : "bg-neutral-50"
      }`}
    >
      {/* ================= HEADER ================= */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: showControls ? 0 : -80 }}
        className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b ${
          isDarkMode
            ? "bg-neutral-950/90 border-neutral-800"
            : "bg-white/90 border-neutral-200"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(`/book/${bookId}`)}
            className="p-2 rounded-xl hover:bg-muted transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h2 className="font-semibold text-sm md:text-base">
              {book?.title || "Book Reader"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Page {currentPage} / {totalPages}
              {!isPurchased && (
                <span className="ml-2 text-amber-500">Preview</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-muted">
              <BookmarkPlus className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl hover:bg-muted"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ================= READER ================= */}
      <main 
        className="max-w-4xl mx-auto px-4 pt-24 pb-28"
        onClick={() => setShowControls((s) => !s)}
      >
        {isPreviewLocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-amber-500/15 mb-6">
              <Lock className="h-12 w-12 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Preview Limit Reached</h2>
            <p className="text-muted-foreground mb-8">
              Purchase this book to unlock all {totalPages} pages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (book) {
                    addToCart(book);
                    navigate("/cart");
                  }
                }}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" /> Buy for ${book?.price}
              </button>
              <button
                onClick={() => navigate(`/book/${bookId}`)}
                className="px-6 py-3 rounded-xl border hover:bg-muted"
              >
                Back to Details
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.article
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`leading-relaxed ${
              isDarkMode ? "text-neutral-100" : "text-neutral-800"
            }`}
            style={{ fontSize }}
          >
            <h1 className="text-4xl font-bold mb-10">
              {isPurchased ? `Chapter ${currentPage}` : "Preview"}
            </h1>

            {previewContent.split("\n\n").map((p, i) => (
              <p key={i} className="mb-6">
                {p}
              </p>
            ))}

            {!isPurchased && currentPage <= freePages && (
              <div className="mt-10 p-6 rounded-xl border bg-amber-500/10 border-amber-500/30 text-sm">
                📖 You are reading the free preview. Purchase to continue.
              </div>
            )}
          </motion.article>
        )}
      </main>

      {/* ================= BOTTOM CONTROLS ================= */}
      <motion.footer
        initial={{ y: 100 }}
        animate={{ y: showControls ? 0 : 100 }}
        className={`fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl border-t ${
          isDarkMode
            ? "bg-neutral-950/90 border-neutral-800"
            : "bg-white/90 border-neutral-200"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {/* Progress */}
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Page Nav */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft />
              </button>
              <span className="text-sm text-muted-foreground px-2">
                {currentPage} / {maxReadablePage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(maxReadablePage, p + 1))
                }
                disabled={currentPage === maxReadablePage}
                className="p-2 rounded-xl hover:bg-muted disabled:opacity-50"
              >
                <ChevronRight />
              </button>
            </div>

            {/* Font */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize((f) => Math.max(12, f - 2))}
                className="p-2 rounded-xl hover:bg-muted"
              >
                <ZoomOut />
              </button>
              <span className="text-xs text-muted-foreground w-10 text-center">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize((f) => Math.min(32, f + 2))}
                className="p-2 rounded-xl hover:bg-muted"
              >
                <ZoomIn />
              </button>
            </div>

            {/* Theme */}
            <button
              onClick={() => setIsDarkMode((d) => !d)}
              className="p-2 rounded-xl hover:bg-muted"
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </button>
          </div>
        </div>
      </motion.footer>

      {/* ================= SETTINGS MODAL ================= */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 ${
                isDarkMode ? "bg-neutral-900" : "bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Reading Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dark Mode</span>
                  <button
                    onClick={() => setIsDarkMode((d) => !d)}
                    className="p-2 rounded-xl hover:bg-muted"
                  >
                    {isDarkMode ? <Sun /> : <Moon />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Font Size</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFontSize((f) => Math.max(12, f - 2))}
                      className="p-2 rounded-xl hover:bg-muted"
                    >
                      <ZoomOut />
                    </button>
                    <button
                      onClick={() => setFontSize((f) => Math.min(32, f + 2))}
                      className="p-2 rounded-xl hover:bg-muted"
                    >
                      <ZoomIn />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReaderPage;