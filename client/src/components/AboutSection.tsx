import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white p-2 rounded-xl shadow-xl">
              <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-lg">Our vision and team</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Vision</h2>
            <p className="text-gray-600 text-lg mb-6">
              We believe productivity tools should work for you, not against you. Our mission is to create an intuitive platform that adapts to your unique workflow, eliminating friction and helping you achieve your goals faster.
            </p>
            <p className="text-gray-600 text-lg mb-6">
              Founded by a team of productivity enthusiasts and technology experts, ProductName was born from our frustration with existing solutions that were either too rigid or too complex.
            </p>
            <p className="text-gray-600 text-lg mb-8">
              We're building a new kind of productivity tool—one that combines powerful features with elegant simplicity, allowing you to focus on what matters most.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-xs">JD</span>
              </div>
              <div>
                <p className="font-medium">John Smith</p>
                <p className="text-gray-500 text-sm">Founder & CEO</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
