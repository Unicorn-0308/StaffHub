import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, UserPlus, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { SUBMIT_SIGNUP_REQUEST } from '../graphql/mutations';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Signup fields
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: 'OTHER',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitSignupRequest] = useMutation(SUBMIT_SIGNUP_REQUEST);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate age
    const age = parseInt(signupData.age, 10);
    if (isNaN(age) || age < 18 || age > 100) {
      setError('Please enter a valid age (18-100)');
      return;
    }

    setIsLoading(true);

    try {
      await submitSignupRequest({
        variables: {
          input: {
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            email: signupData.email,
            password: signupData.password,
            phone: signupData.phone || undefined,
            age,
            gender: signupData.gender,
            address: signupData.address || undefined,
            city: signupData.city || undefined,
            state: signupData.state || undefined,
            country: signupData.country || undefined,
            zipCode: signupData.zipCode || undefined,
          },
        },
      });
      
      setSignupSuccess(true);
      toast.success('Signup request submitted successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit signup request';
      setError(message);
      toast.error(message);
    }
    
    setIsLoading(false);
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleDemoLogin = async (role: 'admin' | 'employee') => {
    setIsLoading(true);
    const credentials = role === 'admin'
      ? { email: 'admin@staffhub.com', password: 'admin123' }
      : { email: 'john@staffhub.com', password: 'employee123' };
    
    setEmail(credentials.email);
    setPassword(credentials.password);
    
    const success = await login(credentials.email, credentials.password);
    if (success) {
      navigate('/');
    }
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setSignupSuccess(false);
    setError('');
    setPassword('');
    setSignupData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      age: '',
      gender: 'OTHER',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    });
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 mb-8">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            
            <h1 className="font-display font-bold text-5xl text-surface-100 mb-4">
              Welcome to{' '}
              <span className="gradient-text">StaffHub</span>
            </h1>
            
            <p className="text-xl text-surface-400 mb-8 leading-relaxed">
              The modern employee management platform that helps you organize, 
              track, and empower your workforce with elegance.
            </p>

            {/* Features */}
            <div className="space-y-4 text-left inline-block">
              {[
                'Beautiful grid and tile views for employee data',
                'Role-based access control for security',
                'Real-time attendance and performance tracking',
                'Powerful search and filtering capabilities',
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                  <span className="text-surface-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 border border-surface-800 rounded-full opacity-20" />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 border border-surface-800 rounded-full opacity-30" />
      </div>

      {/* Right panel - Login/Signup form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md my-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/30 mx-auto mb-4">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="font-display font-bold text-2xl gradient-text">StaffHub</h1>
          </div>

          <div className="card p-8">
            <AnimatePresence mode="wait">
              {/* Signup Success Message */}
              {signupSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-surface-100 mb-2">
                    Request Submitted!
                  </h2>
                  <p className="text-surface-400 mb-6">
                    Your signup request has been sent to the administrator for approval. 
                    You'll be able to login once your account is approved.
                  </p>
                  <button
                    onClick={toggleMode}
                    className="btn-primary"
                  >
                    Back to Sign In
                  </button>
                </motion.div>
              ) : isSignUp ? (
                /* Signup Form */
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-surface-100 mb-2">
                      Create an account
                    </h2>
                    <p className="text-surface-500 text-sm">
                      Fill in your details. Your request will be reviewed by an administrator.
                    </p>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    {/* Name fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          First Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={signupData.firstName}
                          onChange={handleSignupChange}
                          placeholder="John"
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          Last Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={signupData.lastName}
                          onChange={handleSignupChange}
                          placeholder="Doe"
                          required
                          className="input"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        placeholder="john@example.com"
                        required
                        className="input"
                      />
                    </div>

                    {/* Phone and Age */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={signupData.phone}
                          onChange={handleSignupChange}
                          placeholder="+1-234-567-8900"
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          Age <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={signupData.age}
                          onChange={handleSignupChange}
                          placeholder="25"
                          min="18"
                          max="100"
                          required
                          className="input"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={signupData.gender}
                        onChange={handleSignupChange}
                        className="input"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other / Prefer not to say</option>
                      </select>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={signupData.address}
                        onChange={handleSignupChange}
                        placeholder="123 Main Street"
                        className="input"
                      />
                    </div>

                    {/* City, State */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={signupData.city}
                          onChange={handleSignupChange}
                          placeholder="New York"
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={signupData.state}
                          onChange={handleSignupChange}
                          placeholder="NY"
                          className="input"
                        />
                      </div>
                    </div>

                    {/* Country, Zip */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={signupData.country}
                          onChange={handleSignupChange}
                          placeholder="USA"
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={signupData.zipCode}
                          onChange={handleSignupChange}
                          placeholder="10001"
                          className="input"
                        />
                      </div>
                    </div>

                    {/* Passwords */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={signupData.password}
                          onChange={handleSignupChange}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1">
                        Confirm Password <span className="text-red-400">*</span>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        placeholder="••••••••"
                        required
                        className="input"
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full py-3 mt-2"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <UserPlus size={20} />
                          Submit Signup Request
                        </span>
                      )}
                    </button>
                  </form>

                  {/* Toggle to login */}
                  <p className="mt-6 text-center text-sm text-surface-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.div>
              ) : (
                /* Login Form */
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-surface-100 mb-2">
                      Sign in to your account
                    </h2>
                    <p className="text-surface-500">
                      Enter your credentials to access the dashboard
                    </p>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    {/* Email field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-2">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="input"
                      />
                    </div>

                    {/* Password field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me & Forgot password */}
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-surface-700 bg-surface-800 text-primary-500 focus:ring-primary-500/50"
                        />
                        <span className="text-surface-400">Remember me</span>
                      </label>
                      <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
                        Forgot password?
                      </a>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full py-3"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <LogIn size={20} />
                          Sign in
                        </span>
                      )}
                    </button>
                  </form>

                  {/* Toggle to signup */}
                  <p className="mt-6 text-center text-sm text-surface-500">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                    >
                      Sign up
                    </button>
                  </p>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-surface-800" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-surface-900 text-surface-500">
                        Quick demo access
                      </span>
                    </div>
                  </div>

                  {/* Demo buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('admin')}
                      disabled={isLoading}
                      className="btn-secondary py-3 text-sm"
                    >
                      <Sparkles size={16} className="text-primary-400" />
                      Admin Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('employee')}
                      disabled={isLoading}
                      className="btn-secondary py-3 text-sm"
                    >
                      <Sparkles size={16} className="text-accent-400" />
                      Employee Demo
                    </button>
                  </div>

                  {/* Demo credentials hint */}
                  <div className="mt-6 p-4 bg-surface-800/50 rounded-xl border border-surface-700/50">
                    <p className="text-xs text-surface-500 text-center">
                      <strong className="text-surface-400">Demo credentials:</strong><br />
                      Admin: admin@staffhub.com / admin123<br />
                      Employee: john@staffhub.com / employee123
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
