import { motion } from "framer-motion";
import { Leaf, Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function About() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="bg-[#F1F8E9]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_50%,rgba(76,175,80,0.12)_0%,rgba(241,248,233,0)_100%)]"></div>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#2E7D32] mb-6">
              About AgroBuizz
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Transforming agriculture through technology to create a more
              sustainable and efficient future for farmers and consumers alike.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-2 gap-16 items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl font-bold text-[#2E7D32] mb-6">
                Our Mission
              </h2>
              <p className="text-gray-700 mb-6">
                At AgroBuizz, our mission is to revolutionize the agricultural
                marketplace by connecting farmers directly with buyers and
                merchants, eliminating middlemen, and ensuring fair prices for
                all participants.
              </p>
              <p className="text-gray-700 mb-6">
                We aim to build a comprehensive agricultural ecosystem that
                supports sustainable farming practices while making the buying
                and selling process more efficient, transparent, and profitable
                for everyone involved.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="bg-[#E8F5E9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#33691E] mb-2">130+</h3>
                  <p className="text-gray-600 text-sm">Farmers Connected</p>
                </div>
                <div className="bg-[#E8F5E9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#33691E] mb-2">50+</h3>
                  <p className="text-gray-600 text-sm">Agricultural Products</p>
                </div>
                <div className="bg-[#E8F5E9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#33691E] mb-2">20+</h3>
                  <p className="text-gray-600 text-sm">Equipment Options</p>
                </div>
                <div className="bg-[#E8F5E9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#33691E] mb-2">95%</h3>
                  <p className="text-gray-600 text-sm">Customer Satisfaction</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="bg-[#E8F5E9] rounded-2xl p-2"
            >
              <div className="aspect-video bg-[#F1F8E9] rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Leaf className="h-16 w-16 text-[#4CAF50]/30 mx-auto mb-4" />
                  <p className="text-[#33691E]">Our Agricultural Vision</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#2E7D32] mb-4">Our Team</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Meet the passionate experts behind AgroBuizz who are committed to
              transforming agriculture.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-[#8BC34A]/30 hover:border-[#8BC34A] transition-all">
                <div className="aspect-square bg-[#E8F5E9] flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#8BC34A]/20 flex items-center justify-center border-2 border-[#8BC34A]">
                    <span className="text-[#2E7D32] text-xl font-bold">RA</span>
                  </div>
                </div>
                <CardContent className="text-center p-4">
                  <h3 className="text-xl font-bold text-[#2E7D32] mb-1">
                    Rahul Agarwal
                  </h3>
                  <p className="text-[#558B2F] mb-4">Co-Founder & CEO</p>
                  <p className="text-gray-600 text-sm">
                    With over 15 years of experience in sustainable farming,
                    Rahul co-founded AgroBuizz to bridge the gap between farmers
                    and modern technology.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-[#8BC34A]/30 hover:border-[#8BC34A] transition-all">
                <div className="aspect-square bg-[#E8F5E9] flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#8BC34A]/20 flex items-center justify-center border-2 border-[#8BC34A]">
                    <span className="text-[#2E7D32] text-xl font-bold">VJ</span>
                  </div>
                </div>
                <CardContent className="text-center p-4">
                  <h3 className="text-xl font-bold text-[#2E7D32] mb-1">
                    Vansh Jain
                  </h3>
                  <p className="text-[#558B2F] mb-4">
                    Chief Technology Officer
                  </p>
                  <p className="text-gray-600 text-sm">
                    Vansh brings her extensive background in tech innovation to
                    help develop cutting-edge solutions for agricultural
                    challenges.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-[#8BC34A]/30 hover:border-[#8BC34A] transition-all">
                <div className="aspect-square bg-[#E8F5E9] flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#8BC34A]/20 flex items-center justify-center border-2 border-[#8BC34A]">
                    <span className="text-[#2E7D32] text-xl font-bold">TB</span>
                  </div>
                </div>
                <CardContent className="text-center p-4">
                  <h3 className="text-xl font-bold text-[#2E7D32] mb-1">
                    Tanish Bachas
                  </h3>
                  <p className="text-[#558B2F] mb-4">
                    Chief Networking Officer
                  </p>
                  <p className="text-gray-600 text-sm">
                    As the Chief Networking Officer at Agrobuizz, Tanish lead
                    strategic relationship-building across the farming and
                    merchant community, forging strong partnerships that drive
                    platform adoption and trust.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="overflow-hidden border-[#8BC34A]/30 hover:border-[#8BC34A] transition-all">
                <div className="aspect-square bg-[#E8F5E9] flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#8BC34A]/20 flex items-center justify-center border-2 border-[#8BC34A]">
                    <span className="text-[#2E7D32] text-xl font-bold">SB</span>
                  </div>
                </div>
                <CardContent className="text-center p-4">
                  <h3 className="text-xl font-bold text-[#2E7D32] mb-1">
                    Saksham Bansal
                  </h3>
                  <p className="text-[#558B2F] mb-4">
                    Agricultural Marketplace Expert
                  </p>
                  <p className="text-gray-600 text-sm">
                    Saksham's deep understanding of agricultural markets helps
                    ensure fair pricing and efficient distribution for all
                    AgroBuizz participants.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#2E7D32] mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <h3 className="text-xl font-semibold text-[#2E7D32] mb-6">
                Get in Touch
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border-[#8BC34A]/50 focus:border-[#4CAF50]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border-[#8BC34A]/50 focus:border-[#4CAF50]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full border-[#8BC34A]/50 focus:border-[#4CAF50]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Your message..."
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full border-[#8BC34A]/50 focus:border-[#4CAF50]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              <h3 className="text-xl font-semibold text-[#2E7D32] mb-6">
                Contact Information
              </h3>

              <div className="grid gap-6">
                <div className="flex items-start">
                  <div className="bg-[#E8F5E9] p-3 rounded-full mr-4">
                    <Mail className="h-5 w-5 text-[#4CAF50]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600">info@agrobuizz.com</p>
                    <p className="text-gray-600">support@agrobuizz.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#E8F5E9] p-3 rounded-full mr-4">
                    <Phone className="h-5 w-5 text-[#4CAF50]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">+1 (555) 765-4321</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#E8F5E9] p-3 rounded-full mr-4">
                    <MapPin className="h-5 w-5 text-[#4CAF50]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Office</h4>
                    <p className="text-gray-600">123 Green Valley Road</p>
                    <p className="text-gray-600">Agritown, CA 94107</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F1F8E9] p-6 rounded-lg border border-[#8BC34A]/30">
                <h4 className="font-semibold text-[#2E7D32] mb-2">
                  Business Hours
                </h4>
                <div className="space-y-1 text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
