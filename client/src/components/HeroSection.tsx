import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
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
    }
  };

  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_50%,rgba(59,130,246,0.08)_0%,rgba(255,255,255,0)_100%)]"></div>
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block bg-primary-100 text-primary-800 rounded-full px-4 py-1 text-sm font-medium mb-6">
            Coming Soon
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Revolutionize Your <span className="text-primary-600">Workflow</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Experience the next generation productivity tool that adapts to your needs. Streamline tasks, collaborate seamlessly, and achieve more with our intelligent platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
              onClick={() => scrollToSection('waitlist')}
            >
              Join the Waitlist
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 border border-gray-200"
              onClick={() => scrollToSection('features')}
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="mt-16 max-w-5xl mx-auto relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500 text-lg">Product Dashboard Preview</p>
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 -left-3 h-20 bg-gradient-to-t from-gray-50 to-transparent z-10"></div>
        </motion.div>
      </div>
    </section>
  );
}
