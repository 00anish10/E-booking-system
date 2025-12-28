import { motion } from "framer-motion";
import { Book, Clock, Star } from "lucide-react";
import BookCard from "@/components/book-card";

const LibraryPage = () => {
  const myBooks = [
    {
      id: "1",
      title: "The Midnight Library",
      author: "Matt Haig",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
      rating: 4.8,
      price: 12.99,
      category: "Fiction",
    },
    {
      id: "2",
      title: "Atomic Habits",
      author: "James Clear",
      cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
      rating: 4.9,
      price: 15.99,
      category: "Self-Help",
    },
  ];

  const recentlyRead = [
    {
      id: "3",
      title: "Project Hail Mary",
      author: "Andy Weir",
      progress: 65,
    },
    {
      id: "1",
      title: "The Midnight Library",
      author: "Matt Haig",
      progress: 100,
    },
  ];

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-cyan-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Library</h1>
          <p className="text-gray-600 dark:text-gray-300">Access all your purchased and saved books</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: Book, value: myBooks.length, label: "Books Owned", bg: "bg-purple-100", color: "text-purple-500" },
            { icon: Clock, value: "24h", label: "Reading Time", bg: "bg-teal-100", color: "text-teal-500" },
            { icon: Star, value: 8, label: "Books Completed", bg: "bg-yellow-100", color: "text-yellow-500" },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/80 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-xl hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Recently Read */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Continue Reading</h2>
          <div className="grid gap-4">
            {recentlyRead.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-white/80 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">{book.author}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-300">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">{book.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-400 transition-all"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-purple-400 text-white font-medium hover:bg-purple-500 transition-all">
                    {book.progress === 100 ? "Read Again" : "Continue"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* My Books */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {myBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCard {...book} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LibraryPage;
