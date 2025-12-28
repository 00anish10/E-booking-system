import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BookCard from "@/components/book-card";
import { booksData, categories } from "@/data/books";

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"popular" | "price-low" | "price-high" | "rating">("popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let filtered = booksData.filter((book) => {
      const matchesSearch =
        searchQuery === "" ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || book.category === selectedCategory;

      const matchesPrice = book.price >= priceRange[0] && book.price <= priceRange[1];

      const matchesRating = book.rating >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, priceRange, minRating]);

  const activeFiltersCount = 
    (selectedCategory !== "All" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 50 ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory("All");
    setMinRating(0);
    setPriceRange([0, 50]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Book Catalog</h1>
          <p className="text-muted-foreground">Discover your next favorite book from our collection</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, author, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            />
          </div>

          {/* Filter & Sort Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-smooth whitespace-nowrap"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-smooth cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-smooth"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 rounded-xl bg-card border border-border space-y-6"
            >
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Minimum Rating</h3>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
                        minRating === rating
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {rating === 0 ? "All" : `${rating}+ ★`}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredBooks.length}</span> of{" "}
            <span className="font-semibold text-foreground">{booksData.length}</span> books
          </p>
        </motion.div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
              >
                <BookCard {...book} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-xl text-muted-foreground mb-4">No books found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-smooth"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
