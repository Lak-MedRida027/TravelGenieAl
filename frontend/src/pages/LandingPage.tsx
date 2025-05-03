import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Globe, Map, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Globe className="h-8 w-8 text-primary-500" />,
    title: 'AI-Powered Travel Planning',
    description: 'Get personalized travel itineraries crafted by advanced AI technology.'
  },
  {
    icon: <Map className="h-8 w-8 text-primary-500" />,
    title: 'Smart Recommendations',
    description: 'Discover hidden gems and local favorites tailored to your interests.'
  },
  {
    icon: <Plane className="h-8 w-8 text-primary-500" />,
    title: 'Flight Search',
    description: 'Find and compare flights with our integrated flight search system.'
  },
  {
    icon: <Users className="h-8 w-8 text-primary-500" />,
    title: 'Group Planning',
    description: 'Plan trips for groups of any size with smart budget allocation.'
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } }
};

const LandingPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="flex flex-col items-center">
          <Plane className="h-16 w-16 text-white animate-spin mb-6" />
          <span className="text-white text-2xl font-bold tracking-wide animate-pulse">TravelGenie AI</span>
          <span className="text-primary-100 mt-2">Loading your travel experience...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20"
        >
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeUp}>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Plan Your Dream Trip with AI
                </h1>
                <p className="text-lg mb-8 text-primary-100">
                  Let our AI travel assistant create personalized itineraries, find the best flights,
                  and discover hidden gems for your next adventure.
                </p>
                <div className="flex gap-4">
                  <Link
                    to="/signup"
                    className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="hidden md:block">
                <img
                  src="https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg"
                  alt="Travel Planning"
                  className="rounded-lg shadow-xl"
                />
              </motion.div>
            </div>
          </div>
        </motion.section>
        {/* Features Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="py-20 bg-gray-50"
        >
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.h2
              className="text-3xl font-bold text-center mb-12"
              variants={fadeUp}
            >
              Why Choose TravelGenie AI?
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="py-20 bg-white"
        >
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <motion.h2 className="text-3xl font-bold mb-6" variants={fadeUp}>
              Ready to Start Your Journey?
            </motion.h2>
            <motion.p className="text-lg text-gray-600 mb-8" variants={fadeIn}>
              Join thousands of travelers who use TravelGenie AI to plan their perfect trips.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/signup"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-block"
              >
                Create Free Account
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;