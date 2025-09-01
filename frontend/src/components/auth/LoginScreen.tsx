import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { LoadingSpinner } from '../LoadingSpinner';
import { PixelatedCanvas } from '../ui/pixelated-canvas';
import localImage from '../../assets/image.png';
import whiteLogo from '../../assets/logo-white.png';
import toast from 'react-hot-toast';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({ username: '', password: '' });
    
    // Validate fields
    const newErrors = { username: '', password: '' };
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    // If there are errors, set them and return
    if (newErrors.username || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    const success = await login(username, password);
    if (!success) {
      toast.error('Invalid credentials. Try admin/admin123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Pixelated Background Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <PixelatedCanvas
          src={localImage}
          width={window.innerWidth}
          height={window.innerHeight}
          cellSize={4}
          dotScale={0.9}
          shape="square"
          backgroundColor="#000000"
          dropoutStrength={0.1}
          interactive
          distortionStrength={20}
          distortionRadius={200}
          distortionMode="swirl"
          followSpeed={0.2}
          jitterStrength={6}
          jitterSpeed={1.2}
          sampleAverage
          fadeOnLeave
          fadeSpeed={0.08}
          className="w-full h-full object-cover"
          responsive
        />
      </div>
      
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-5 pointer-events-none"></div>

      <div className="max-w-sm w-full relative z-20">
        {/* Logo */}
        <div className="text-center mb-7">
          <img src={whiteLogo} alt="Logo" className="h-10 mx-auto mb-1" />
          <p className="text-gray-400 text-sm">Please sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-900/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">

          <form onSubmit={handleSubmit} className="space-y-0">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-3">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: '' }));
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-black/30 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 autofill:bg-black/30 autofill:text-white ${
                    errors.username 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-blue-500'
                  }`}
                  style={{
                    WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.3) inset',
                    WebkitTextFillColor: 'white',
                  }}
                  placeholder="Enter Username"
                  disabled={isLoading}
                />
              </div>
              <div className="h-6 mt-2">
                {errors.username && (
                  <p className="text-sm text-red-400">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  className={`w-full pl-10 pr-12 py-3 bg-black/30 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 autofill:bg-black/30 autofill:text-white ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-blue-500'
                  }`}
                  style={{
                    WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.3) inset',
                    WebkitTextFillColor: 'white',
                  }}
                  placeholder="Enter Password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <div className="h-6 mt-2">
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4F7CF7] hover:bg-[#4F7CF7]/90 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer with your name inside card */}
          <div className="text-center mt-6 pt-6 border-t border-gray-700/50">
            <p className="text-gray-500 text-sm">
              Designed & Built by <span className="text-white font-medium">Anshab Aslam</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}