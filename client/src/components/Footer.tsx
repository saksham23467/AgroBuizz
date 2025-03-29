import { Facebook, Twitter, Instagram, Mail, MapPin, Code, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#E8F5E9] text-[#4CAF50] p-2 rounded-lg">
                <Code className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">AgroBuizz</span>
            </div>
            <p className="text-gray-400 mb-4">Revolutionizing agriculture with our marketplace platform connecting farmers, merchants, and buyers.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white transition">Features</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition">About Us</a></li>
              <li><a href="#waitlist" className="text-gray-400 hover:text-white transition">Join Waitlist</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-400">contact@agrobuizz.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-400">456 Farming District<br />Agro City, AC 67890</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} AgroBuizz. All rights reserved.</p>
          <div className="mt-4 flex justify-center items-center">
            <Link to="/login" className="flex items-center text-gray-400 hover:text-white transition text-xs">
              <Lock className="h-3 w-3 mr-1" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
