import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Star, BookOpen, Download, Heart, Share2, ArrowLeft, ShoppingCart } from "lucide-react";
import { booksData } from "@/data/books";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";

const BookDetailPage = () => {
  const { bookId } = useParams();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [message, setMessage] = useState(""); // <-- Message state
  const { addToCart, purchasedBooks } = useCart();

  const book = booksData.find((b) => b.id === bookId) || booksData[0];
  const isPurchased = purchasedBooks.includes(book.id);
  const relatedBooks = booksData
    .filter((b) => b.category === book.category && b.id !== book.id)
    .slice(0, 6);

  const reviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      text: "An absolutely captivating read! The concept is brilliant and the execution is perfect.",
    },
    {
      id: 2,
      author: "John D.",
      rating: 4,
      date: "1 month ago",
      text: "Really enjoyed this book. The writing style is engaging and the story keeps you hooked.",
    },
    {
      id: 3,
      author: "Emily R.",
      rating: 5,
      date: "2 months ago",
      text: "One of the best books I've read this year. Highly recommend to everyone!",
    },
  ];

  const handleAddToCart = () => {
    addToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover: book.cover,
    });
    setMessage(`${book.title} added to cart!`);

    setTimeout(() => setMessage(""), 3000); // Hide after 3 seconds
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-pink-50 via-purple-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-700 transition-all mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Catalog
        </Link>

        {/* Book Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all max-w-md mx-auto">
              <img src={book.cover} alt={book.title} className="w-full object-cover" />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <span className="px-3 py-1 rounded-full bg-pink-200/40 text-pink-600 text-sm font-medium">
                {book.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">{book.title}</h1>
              <p className="text-lg text-gray-700">by {book.author}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-semibold text-gray-900">{book.rating}</span>
                <span className="text-gray-500">({book.reviews} reviews)</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-purple-500">${book.price}</div>

            <div className="flex flex-wrap gap-3">
              {isPurchased ? (
                <Link
                  to={`/reader/${book.id}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-400 text-white font-medium hover:bg-purple-500 transition-all shadow-lg"
                >
                  <BookOpen className="h-5 w-5" />
                  Read Full Book
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-pink-200 text-pink-700 font-medium hover:bg-pink-300 transition-all shadow-lg"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                  <Link
                    to={`/reader/${book.id}`}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    <BookOpen className="h-5 w-5" />
                    Read Preview
                  </Link>
                </>
              )}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-3 rounded-lg border border-gray-300 hover:bg-pink-100 transition-all"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </button>
              <button className="p-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all">
                <Share2 className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className="mt-4 p-3 bg-purple-100 text-purple-700 rounded-lg shadow-md animate-fade-in">
                {message}
              </div>
            )}

            <div className="pt-6 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Pages:</span>
                  <span className="ml-2 text-gray-900 font-medium">{book.pages}</span>
                </div>
                <div>
                  <span className="text-gray-500">Language:</span>
                  <span className="ml-2 text-gray-900 font-medium">{book.language}</span>
                </div>
                <div>
                  <span className="text-gray-500">Publisher:</span>
                  <span className="ml-2 text-gray-900 font-medium">{book.publisher}</span>
                </div>
                <div>
                  <span className="text-gray-500">Published:</span>
                  <span className="ml-2 text-gray-900 font-medium">{book.publishDate}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "details"
                      ? "bg-purple-400 text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "reviews"
                      ? "bg-purple-400 text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
              </div>

              {activeTab === "details" ? (
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold mb-3">About this book</h2>
                    <p className="leading-relaxed">{book.description}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-xl font-bold mb-3">About the Author</h3>
                    <p className="leading-relaxed">{book.authorBio}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                    <button className="px-4 py-2 rounded-lg bg-purple-400 text-white font-medium hover:bg-purple-500 transition-all">
                      Write a Review
                    </button>
                  </div>
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-lg bg-purple-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{review.author}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Books */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Books</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {relatedBooks.map((relatedBook, index) => (
              <motion.div
                key={relatedBook.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/book/${relatedBook.id}`} className="group block">
                  <div className="rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                    <img
                      src={relatedBook.cover}
                      alt={relatedBook.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-500 transition-all">
                    {relatedBook.title}
                  </h3>
                  <p className="text-sm text-gray-500">{relatedBook.author}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{relatedBook.rating}</span>
                    </div>
                    <span className="text-sm font-bold text-purple-500">${relatedBook.price}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookDetailPage;
