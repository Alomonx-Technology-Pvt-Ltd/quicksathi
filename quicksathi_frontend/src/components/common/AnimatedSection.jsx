import { motion } from "framer-motion";

const AnimatedSection = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.45,
        delay: Math.min(delay, 0.2),
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;