import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-[#F1F8E9]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white p-2 rounded-xl shadow-xl border border-[#8BC34A]/30">
              <div className="w-full h-[400px] bg-[#E8F5E9] rounded-lg flex items-center justify-center">
                <p className="text-[#33691E] text-lg">Farmers & Merchants in the Market</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#2E7D32]">Our Mission</h2>
            <p className="text-gray-700 text-lg mb-6">
              AgroBuizz aims to revolutionize the agricultural marketplace by connecting farmers directly with buyers and merchants, eliminating middlemen, and ensuring fair prices for all participants.
            </p>
            <p className="text-gray-700 text-lg mb-6">
              Founded by a team of agricultural experts and technology innovators, our platform addresses the challenges faced by small-scale farmers who struggle to access quality farming inputs and find reliable buyers for their produce.
            </p>
            <p className="text-gray-700 text-lg mb-8">
              We're building a comprehensive agricultural ecosystem that supports sustainable farming practices while making the buying and selling process more efficient, transparent, and profitable for everyone involved.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#8BC34A]/20 flex items-center justify-center border-2 border-[#8BC34A]">
                <span className="text-[#33691E] text-xs font-bold">RA</span>
              </div>
              <div>
                <p className="font-medium text-[#33691E]">Rahul Agarwal</p>
                <p className="text-[#558B2F] text-sm">Co-founder & CEO | BTech CSAM 2027 (2023418)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
