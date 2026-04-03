import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: ['Features', 'Pricing', 'Security', 'API'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Resources: ['Documentation', 'Community', 'Support', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Cookies', 'License'],
  };

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com', name: 'GitHub' },
    { icon: FiLinkedin, href: 'https://linkedin.com', name: 'LinkedIn' },
    { icon: FiTwitter, href: 'https://twitter.com', name: 'Twitter' },
    { icon: FiMail, href: 'mailto:contact@exammind.com', name: 'Email' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0,y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <footer className="relative bg-black border-t border-gray-800/50 backdrop-blur-xl">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-20 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12"
          >
            {/* Brand */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <span className="text-white font-bold text-xl">ExamMind</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-powered exam analyzer helping students identify weaknesses and build personalized
                revision plans.
              </p>
              <div className="flex gap-3 pt-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, color: '#ff6b00' }}
                      whileTap={{ scale: 0.95 }}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                      title={social.name}
                    >
                      <Icon size={20} />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <motion.div key={category} variants={itemVariants} className="space-y-4">
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <motion.a
                        href="#"
                        whileHover={{ x: 5, color: '#ff6b00' }}
                        className="text-gray-400 hover:text-orange-500 transition-all text-sm"
                      >
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent my-12"></div>

          {/* Bottom */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <motion.div variants={itemVariants} className="text-gray-400 text-sm text-center md:text-left">
              <p>
                © {currentYear} ExamMind. All rights reserved. | Built for students, by students.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                A hackathon project by passionate developers
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
                GitHub Repo
              </a>
              <div className="w-px h-4 bg-gray-700/50"></div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                All Systems Operational
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </footer>
  );
}
