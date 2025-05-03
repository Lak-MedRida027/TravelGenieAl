import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

const steps = [
  "Scanning destinations...",
  "Finding local gems...",
  "Crafting your perfect itinerary...",
  "Checking best accommodation options...",
  "Finalizing travel recommendations..."
];

const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="mb-8"
      >
        <Plane className="w-16 h-16 text-primary-500" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Your travel plan is being crafted
      </h3>
      
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Our AI is working to create your personalized travel itinerary. This may take a minute.
      </p>
      
      <div className="w-full max-w-md bg-gray-100 rounded-full h-2.5 mb-6">
        <motion.div 
          className="bg-primary-500 h-2.5 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 15, ease: "linear" }}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="text-sm text-gray-600"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            transition: { 
              duration: 3,
              times: [0, 0.1, 0.9, 1],
              repeat: Infinity,
              repeatDelay: 0
            }
          }}
        >
          {steps.map((step, index) => (
            <motion.p
              key={index}
              initial={{ display: "none" }}
              animate={{ 
                display: "block",
                transition: { delay: index * 3 } 
              }}
              className="min-h-6"
            >
              {step}
            </motion.p>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingIndicator;