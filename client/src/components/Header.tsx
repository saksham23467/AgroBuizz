import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, ShoppingCart, User } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Check if we're on the home page where we need to use scrolling
  const isHomePage = location === "/";

  const scrollToSection = (id: string) => {
    if (!isHomePage) return;
    
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

  const handleNavAction = (action: string) => {
    setMobileMenuOpen(false);
    
    if (isHomePage && (action === 'features' || action === 'about' || action === 'waitlist')) {
      scrollToSection(action);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] text-white p-2 rounded-lg">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-[#2E7D32]">AgroBuizz</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-600 hover:text-[#4CAF50] font-medium transition">
                Markets
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/seed-market" className="cursor-pointer">Seed Market</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/equipment-market" className="cursor-pointer">Equipment Market</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/produce-market" className="cursor-pointer">Produce Market</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link href="/about">
            <span className="text-gray-600 hover:text-[#4CAF50] font-medium transition cursor-pointer">
              About Us
            </span>
          </Link>
          
          {isHomePage && (
            <button 
              onClick={() => scrollToSection('waitlist')} 
              className="text-gray-600 hover:text-[#4CAF50] font-medium transition"
            >
              Join Waitlist
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <Link href="/checkout" className="relative">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#4CAF50]">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/login">
              <Button className="bg-[#4CAF50] hover:bg-[#43A047]">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
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
          <Link href="/seed-market" onClick={() => handleNavAction('')}>
            <span className="block py-2 text-gray-600 hover:text-[#4CAF50] font-medium w-full text-left">
              Seed Market
            </span>
          </Link>
          <Link href="/equipment-market" onClick={() => handleNavAction('')}>
            <span className="block py-2 text-gray-600 hover:text-[#4CAF50] font-medium w-full text-left">
              Equipment Market
            </span>
          </Link>
          <Link href="/produce-market" onClick={() => handleNavAction('')}>
            <span className="block py-2 text-gray-600 hover:text-[#4CAF50] font-medium w-full text-left">
              Produce Market
            </span>
          </Link>
          <Link href="/about" onClick={() => handleNavAction('')}>
            <span className="block py-2 text-gray-600 hover:text-[#4CAF50] font-medium w-full text-left">
              About Us
            </span>
          </Link>
          
          {isHomePage && (
            <button 
              onClick={() => scrollToSection('waitlist')} 
              className="block py-2 text-gray-600 hover:text-[#4CAF50] font-medium w-full text-left"
            >
              Join Waitlist
            </button>
          )}
          
          <Link href="/checkout" onClick={() => handleNavAction('')}>
            <span className="block py-2 text-gray-600 hover:text-[#4CAF50] font-medium w-full text-left">
              Cart
            </span>
          </Link>
          <Link href="/login" onClick={() => handleNavAction('')}>
            <span className="block py-2 text-gray-600 hover:text-[#4CAF50] font-medium w-full text-left">
              Login
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
