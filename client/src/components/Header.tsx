import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Code } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-primary-600 to-accent text-white p-2 rounded-lg">
            <Code className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">ProductName</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-gray-600 hover:text-primary-600 font-medium transition"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('about')} 
            className="text-gray-600 hover:text-primary-600 font-medium transition"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('waitlist')} 
            className="text-gray-600 hover:text-primary-600 font-medium transition"
          >
            Join Waitlist
          </button>
        </nav>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 bg-white shadow-md">
          <button 
            onClick={() => scrollToSection('features')} 
            className="block py-2 text-gray-600 hover:text-primary-600 font-medium w-full text-left"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('about')} 
            className="block py-2 text-gray-600 hover:text-primary-600 font-medium w-full text-left"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('waitlist')} 
            className="block py-2 text-gray-600 hover:text-primary-600 font-medium w-full text-left"
          >
            Join Waitlist
          </button>
        </div>
      )}
    </header>
  );
}
