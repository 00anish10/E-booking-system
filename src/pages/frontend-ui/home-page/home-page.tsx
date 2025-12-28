import { motion } from "framer-motion";
import { BookOpen, Search, Star, TrendingUp, Zap, Award, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-books.jpg";
import readingCorner from "@/assets/reading-corner.jpg";
import { booksData } from "@/data/books";
import BookCard from "@/components/book-card";

const HomePage = () => {
  const featuredBooks = booksData.filter((book) => book.bestseller).slice(0, 4);
  const trendingBooks = booksData.filter((book) => book.trending).slice(0, 6);
  const newReleases = booksData.filter((book) => book.newRelease).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden  via-blue-600 to-indigo-700">
        <div className="absolute inset-0 opacity-20">
          <img src={heroImage} alt="Books" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight text-balance">
                Discover Your Next Great Read
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-xl text-balance">
                Access thousands of e-books across all genres. Read anywhere, anytime on any device.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/catalog"
                  className="inline-flex bg-white items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-smooth shadow-lg hover:shadow-glow"
                >
                  Browse Catalog
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground font-medium hover:bg-primary-foreground/20 transition-smooth border border-primary-foreground/20"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src={readingCorner}
                alt="Reading"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20  border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, label: "Books", value: "20K+" },
              { icon: Award, label: "Authors", value: "5K+" },
              { icon: Star, label: "Reviews", value: "100K+" },
              { icon: Clock, label: "Reading Time", value: "24/7" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-background border border-border hover:shadow-elegant transition-smooth"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Books */}
      <section className="py-20 bg-gradient-to-b from-transparent to-orange-50/50 dark:to-orange-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">Trending Now</h2>
              </div>
              <p className="text-muted-foreground">Most popular books this week</p>
            </div>
            <Link
              to="/catalog"
              className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-smooth"
            >
              View All
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trendingBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/book/${book.id}`} className="group block">
                  <div className="relative rounded-lg overflow-hidden shadow-elegant group-hover:shadow-glow transition-smooth">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-smooth duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Hot
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-smooth">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">{book.rating}</span>
                    </div>
                    <span className="text-lg font-bold text-primary">${book.price}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Releases */}
      {newReleases.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:from-green-950/10 dark:via-teal-950/10 dark:to-cyan-950/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">New Releases</h2>
                <p className="text-muted-foreground">Fresh additions to our collection</p>
              </div>
              <Link
                to="/catalog"
                className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-smooth"
              >
                See More
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newReleases.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BookCard {...book} category={book.category} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      <section className="py-20 bg-gradient-to-t from-pink-50/50 to-transparent dark:from-pink-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">Bestsellers</h2>
              </div>
              <p className="text-muted-foreground">Our most loved books</p>
            </div>
            <Link
              to="/catalog"
              className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-smooth"
            >
              View All
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCard {...book} category={book.category} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-12 rounded-2xl bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 shadow-2xl space-y-6 transition-all hover:shadow-3xl"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
        Start Your Reading Journey Today
      </h2>
      <p className="text-lg text-gray-800/90 max-w-2xl mx-auto">
        Join thousands of readers worldwide. Get access to unlimited books for just $9.99/month.
      </p>
      <Link
        to="/signup"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-purple-400 text-white font-medium hover:bg-purple-500 transition-all shadow-lg hover:shadow-xl"
      >
        Start Free Trial
        <ArrowRight className="h-5 w-5" />
      </Link>
    </motion.div>
  </div>
</section>

    </div>
  );
};

export default HomePage;
