import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

function FloatingOrb({ className }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default function SignIn() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      if (mode === 'signin') await signInEmail(email, password);
      else await signUpEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'Email already registered. Try signing in.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/invalid-credential': 'Invalid email or password.',
      }[err.code] || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #09090b 0%, #0f0f13 100%)' }}>

      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,107,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <FloatingOrb className="w-[500px] h-[500px] bg-orange-600/10 -top-40 -right-40" />
      <FloatingOrb className="w-[400px] h-[400px] bg-purple-600/8 -bottom-20 -left-20" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <FiZap className="text-white" size={20} />
          </div>
          <span className="text-2xl font-black text-white">
            Exam<span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">AI</span>
          </span>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex rounded-2xl bg-white/5 border border-white/8 p-1 mb-8">
            {['signin', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                  mode === m
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'signin' ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl font-black text-white mb-1">
                {mode === 'signin' ? 'Welcome back 👋' : 'Get started free'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {mode === 'signin'
                  ? 'Sign in to access your course analyses and revision plans.'
                  : 'Create an account to start analyzing your exam performance.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Google btn */}
          <motion.button
            onClick={handleGoogle}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 text-white font-semibold transition-all duration-200 mb-5 disabled:opacity-50"
          >
            <FcGoogle size={20} />
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-gray-600 text-xs font-medium">or with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/8 text-white placeholder-gray-600 text-sm font-medium focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white/5 border border-white/8 text-white placeholder-gray-600 text-sm font-medium focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  <FiAlertCircle size={16} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(255,107,0,0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black rounded-2xl shadow-xl shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'signin' ? 'Sign In →' : 'Create Account →'
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
