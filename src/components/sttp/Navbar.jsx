import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiGithub, FiMenu, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'Upload', to: '/upload' },
    { name: 'Dashboard', to: '/dashboard' },
    { name: 'Progress', to: '/progress' },
    { name: 'Recommendations', to: '/recommendations' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 backdrop-blur-3xl bg-[radial-gradient(circle_at_top,_rgba(254,78,3,0.15),_rgba(18,16,23,0.85))] border-b border-orange-500/20 shadow-lg"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:inline">ExamMind</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 whitespace-nowrap">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `mr-2 px-4 py-2 rounded-lg text-base font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'text-orange-300 bg-white/10 border border-orange-500/40 shadow-lg shadow-orange-500/25'
                      : 'text-gray-200 hover:text-orange-400 hover:bg-white/10 hover:border hover:border-orange-500/20 hover:scale-105'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center gap-8">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <FiGithub className="text-gray-300 text-xl" />
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-orange-600/50"
            >
              Login
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="p-2"
            >
              <FiGithub className="text-gray-300 text-xl" />
            </motion.a>
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1 }}
              className="text-gray-300"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden bg-black/50 backdrop-blur-md border-t border-gray-800/50"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block text-sm font-medium py-2 transition-colors ${
                    isActive ? 'text-orange-400' : 'text-gray-300 hover:text-orange-500'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-orange-600/50 mt-4"
            >
              Login
            </motion.button>
          </div>
        </motion.div>
      </div>
      </motion.nav>
      <div className="h-20" aria-hidden="true" />
    </>
  );
}
