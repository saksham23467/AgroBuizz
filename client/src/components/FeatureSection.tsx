import { motion } from "framer-motion";
import { Zap, Shield, MessageSquare, Layout, BarChart3, Sparkles } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureSection() {
  const features: Feature[] = [
    {
      icon: <Zap className="h-6 w-6 text-primary-600" />,
      title: "Lightning Fast",
      description: "Experience unparalleled speed with our optimized performance engine, designed for zero lag."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary-600" />,
      title: "Bank-Level Security",
      description: "Your data is protected with end-to-end encryption and advanced security protocols."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary-600" />,
      title: "Real-time Collaboration",
      description: "Work together with your team simultaneously on projects with instant updates."
    },
    {
      icon: <Layout className="h-6 w-6 text-primary-600" />,
      title: "Smart Templates",
      description: "Start quickly with customizable templates designed for various workflows and projects."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary-600" />,
      title: "Advanced Analytics",
      description: "Gain insights into your productivity patterns with detailed analytics and reporting."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary-600" />,
      title: "AI-Powered Assistance",
      description: "Let our intelligent assistant help you optimize tasks and suggest improvements."
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600">Designed to enhance your productivity and streamline your workflow</p>
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
              className="feature-card bg-white rounded-xl p-6 shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl hover:-translate-y-1"
              variants={featureVariants}
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
