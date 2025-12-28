import { BookOpen, Github, Mail, Twitter } from "lucide-react";

const FrontendFooter = () => {
   return (
    <footer className="bg-white border-t border-[hsl(40,15%,85%)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(230,45%,25%)]">
                <BookOpen className="h-5 w-5 text-[hsl(40,20%,97%)]" />
              </div>
              <span className="font-bold text-lg">ReadVerse</span>
            </div>
            <p className="text-sm text-[hsl(230,15%,45%)]">
              Your gateway to endless stories and knowledge. Read, discover, and grow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/catalog" className="text-sm text-[hsl(230,15%,45%)] hover:text-[hsl(230,25%,15%)] transition-all duration-300">
                  Browse Books
                </a>
              </li>
              <li>
                <a href="/library" className="text-sm text-[hsl(230,15%,45%)] hover:text-[hsl(230,25%,15%)] transition-all duration-300">
                  My Library
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[hsl(230,15%,45%)] hover:text-[hsl(230,25%,15%)] transition-all duration-300">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-[hsl(230,15%,45%)] hover:text-[hsl(230,25%,15%)] transition-all duration-300">
                  Fiction
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[hsl(230,15%,45%)] hover:text-[hsl(230,25%,15%)] transition-all duration-300">
                  Non-Fiction
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[hsl(230,15%,45%)] hover:text-[hsl(230,25%,15%)] transition-all duration-300">
                  Science
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[hsl(230,15%,45%)] hover:text-[hsl(230,25%,15%)] transition-all duration-300">
                  Business
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-[hsl(40,15%,90%)] hover:bg-[hsl(230,45%,25%)] hover:text-[hsl(40,20%,97%)] transition-all duration-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-[hsl(40,15%,90%)] hover:bg-[hsl(230,45%,25%)] hover:text-[hsl(40,20%,97%)] transition-all duration-300"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-[hsl(40,15%,90%)] hover:bg-[hsl(230,45%,25%)] hover:text-[hsl(40,20%,97%)] transition-all duration-300"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[hsl(40,15%,85%)]">
          <p className="text-center text-sm text-[hsl(230,15%,45%)]">
            © 2024 ReadVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};



export default FrontendFooter;