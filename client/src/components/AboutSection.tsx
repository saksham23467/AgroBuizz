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
                <p className="text-gray-500 text-lg">Farmers & Merchants in the Market</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg mb-6">
              AgroBuizz aims to revolutionize the agricultural marketplace by connecting farmers directly with buyers and merchants, eliminating middlemen, and ensuring fair prices for all participants.
            </p>
            <p className="text-gray-600 text-lg mb-6">
              Founded by a team of agricultural experts and technology innovators, our platform addresses the challenges faced by small-scale farmers who struggle to access quality farming inputs and find reliable buyers for their produce.
            </p>
            <p className="text-gray-600 text-lg mb-8">
              We're building a comprehensive agricultural ecosystem that supports sustainable farming practices while making the buying and selling process more efficient, transparent, and profitable for everyone involved.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-xs">JD</span>
              </div>
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-gray-500 text-sm">Founder & Agricultural Expert</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
