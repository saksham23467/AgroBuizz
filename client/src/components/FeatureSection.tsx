import { motion } from "framer-motion";
import { Leaf, Tractor, Store, ShoppingBag, TrendingUp, Users } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureSection() {
  const features: Feature[] = [
    {
      icon: <Leaf className="h-6 w-6 text-primary-600" />,
      title: "Quality Seeds",
      description: "Access a wide range of crop seeds, vegetable seeds, and more from trusted suppliers and certified merchants."
    },
    {
      icon: <Tractor className="h-6 w-6 text-primary-600" />,
      title: "Farming Equipment",
      description: "Find all your agricultural equipment needs from traditional tools to modern machinery at competitive prices."
    },
    {
      icon: <Store className="h-6 w-6 text-primary-600" />,
      title: "Vegetable Market",
      description: "Connect directly with farmers to purchase fresh, seasonal vegetables and fruits for your business or home."
    },
    {
      icon: <ShoppingBag className="h-6 w-6 text-primary-600" />,
      title: "One-Stop Shop",
      description: "Everything you need for farming and agriculture in one platform, from planting to harvesting and selling."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary-600" />,
      title: "Market Insights",
      description: "Get real-time pricing trends, demand forecasts, and agricultural market intelligence to maximize profits."
    },
    {
      icon: <Users className="h-6 w-6 text-primary-600" />,
      title: "Community Support",
      description: "Join a thriving community of farmers, suppliers, and buyers who share knowledge and best practices."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2E7D32]">Our Product Categories</h2>
          <p className="text-xl text-gray-700">Everything you need for your agricultural business in one marketplace</p>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="feature-card bg-white rounded-xl p-6 shadow-lg border border-[#8BC34A]/30 transition duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#8BC34A]"
              variants={featureVariants}
            >
              <div className="w-12 h-12 bg-[#E8F5E9] rounded-lg flex items-center justify-center mb-4">
                <div className="h-6 w-6 text-[#4CAF50]">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#33691E]">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
