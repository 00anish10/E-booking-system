import { motion } from "framer-motion";
import { Star, BookOpen } from "lucide-react";
import { Link } from "react-router";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  price: number;
  category: string;
}

const BookCard = ({ id, title, author, cover, rating, price, category }: BookCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link to={`/book/${id}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-white border border-[hsl(40,15%,85%)] shadow-[0_10px_30px_-10px_hsl(230,45%,25%,0.3)] hover:shadow-[0_0_40px_hsl(35,90%,65%,0.4)] transition-all duration-300">
          {/* Cover Image */}
          <div className="aspect-[2/3] overflow-hidden bg-[hsl(40,15%,90%)]">
            <img
              src={cover}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            />
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full bg-[hsl(40,20%,97%)]/90 backdrop-blur-sm text-xs font-medium text-[hsl(230,25%,15%)] border border-[hsl(40,15%,85%)]">
              {category}
            </span>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-[hsl(230,25%,15%)] line-clamp-2 group-hover:text-[hsl(230,45%,25%)] transition-all duration-300">
              {title}
            </h3>
            <p className="text-sm text-[hsl(230,15%,45%)]">{author}</p>

            {/* Rating & Price */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[hsl(35,80%,60%)] text-[hsl(35,80%,60%)]" />
                <span className="text-sm font-medium text-[hsl(230,25%,15%)]">{rating}</span>
              </div>
              <span className="text-lg font-bold text-[hsl(230,45%,25%)]">${price}</span>
            </div>
          </div>
        </div>

        {/* Hover Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-[hsl(230,45%,25%)]/10 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(230,45%,25%)] text-[hsl(40,20%,97%)] font-medium shadow-lg">
            <BookOpen className="h-5 w-5" />
            <span>View Details</span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default BookCard;
