import { Link } from "wouter";
import { ExternalLink, Mail, PhoneCall, MapPin, Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// Founder information
const founders = [
  { name: "Rahul Agarwal", role: "CEO & Co-founder" },
  { name: "Saksham Bansal", role: "CTO & Co-founder" },
  { name: "Vansh Jain", role: "COO & Co-founder" },
  { name: "Tanish Bachas", role: "CMO & Co-founder" }
];

export default function Footer() {
  const { isDarkMode } = useTheme();
  return (
    <footer className={`${isDarkMode ? 'bg-[#181818] border-t border-[#424242]' : 'bg-[#F1F8E9] border-t border-[#E8F5E9]'} transition-colors`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className={`${isDarkMode ? 'text-[#8BC34A]' : 'text-[#2E7D32]'} font-bold text-xl mb-4`}>AgroBuizz</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              Connecting farmers, vendors, and customers in a sustainable agricultural ecosystem.
            </p>
            <div className="flex space-x-4">
              <a href="#" className={`${isDarkMode ? 'text-[#8BC34A] hover:text-[#BBDB9B]' : 'text-[#4CAF50] hover:text-[#2E7D32]'}`}>
                <Facebook size={20} />
              </a>
              <a href="#" className={`${isDarkMode ? 'text-[#8BC34A] hover:text-[#BBDB9B]' : 'text-[#4CAF50] hover:text-[#2E7D32]'}`}>
                <Twitter size={20} />
              </a>
              <a href="#" className={`${isDarkMode ? 'text-[#8BC34A] hover:text-[#BBDB9B]' : 'text-[#4CAF50] hover:text-[#2E7D32]'}`}>
                <Instagram size={20} />
              </a>
              <a href="#" className={`${isDarkMode ? 'text-[#8BC34A] hover:text-[#BBDB9B]' : 'text-[#4CAF50] hover:text-[#2E7D32]'}`}>
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className={`${isDarkMode ? 'text-[#8BC34A]' : 'text-[#2E7D32]'} font-bold text-lg mb-4`}>Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-[#8BC34A]' : 'text-gray-600 hover:text-[#4CAF50]'}`}>Home</Link>
              </li>
              <li>
                <Link href="/about" className={`${isDarkMode ? 'text-gray-300 hover:text-[#8BC34A]' : 'text-gray-600 hover:text-[#4CAF50]'}`}>About Us</Link>
              </li>
              <li>
                <Link href="/seed-market" className={`${isDarkMode ? 'text-gray-300 hover:text-[#8BC34A]' : 'text-gray-600 hover:text-[#4CAF50]'}`}>Seed Market</Link>
              </li>
              <li>
                <Link href="/equipment-market" className={`${isDarkMode ? 'text-gray-300 hover:text-[#8BC34A]' : 'text-gray-600 hover:text-[#4CAF50]'}`}>Equipment Market</Link>
              </li>
              <li>
                <Link href="/produce-market" className={`${isDarkMode ? 'text-gray-300 hover:text-[#8BC34A]' : 'text-gray-600 hover:text-[#4CAF50]'}`}>Produce Market</Link>
              </li>
              <li>
                <Link href="/admin-login" className={`${isDarkMode ? 'text-gray-300 hover:text-[#8BC34A]' : 'text-gray-600 hover:text-[#4CAF50]'}`}>Admin Login</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className={`${isDarkMode ? 'text-[#8BC34A]' : 'text-[#2E7D32]'} font-bold text-lg mb-4`}>Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className={`mr-2 h-5 w-5 ${isDarkMode ? 'text-[#8BC34A]' : 'text-[#4CAF50]'} flex-shrink-0 mt-0.5`} />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>123 Agriculture Avenue, Farmland District, IN 560001</span>
              </li>
              <li className="flex items-center">
                <PhoneCall className={`mr-2 h-5 w-5 ${isDarkMode ? 'text-[#8BC34A]' : 'text-[#4CAF50]'}`} />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>+91 123 456 7890</span>
              </li>
              <li className="flex items-center">
                <Mail className={`mr-2 h-5 w-5 ${isDarkMode ? 'text-[#8BC34A]' : 'text-[#4CAF50]'}`} />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>info@agrobuizz.com</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className={`${isDarkMode ? 'text-[#8BC34A]' : 'text-[#2E7D32]'} font-bold text-lg mb-4`}>Our Founders</h3>
            <ul className="space-y-2">
              {founders.map((founder, index) => (
                <motion.li 
                  key={index}
                  className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="font-medium">{founder.name}</span>
                  <span className={`text-sm block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{founder.role}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className={`${isDarkMode ? 'border-t border-[#424242]' : 'border-t border-[#E8F5E9]'} mt-10 pt-6 flex flex-col md:flex-row justify-between items-center`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4 md:mb-0`}>
            &copy; {new Date().getFullYear()} AgroBuizz. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-[#8BC34A]' : 'text-gray-600 hover:text-[#4CAF50]'}`}>Privacy Policy</a>
            <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-[#8BC34A]' : 'text-gray-600 hover:text-[#4CAF50]'}`}>Terms of Service</a>
            <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-[#8BC34A]' : 'text-gray-600 hover:text-[#4CAF50]'}`}>Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}