import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, verifyOtp, verifyGoogleToken } from '../../lib/api';

type AuthStep = 'EMAIL' | 'OTP';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<AuthStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const onGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await verifyGoogleToken(credentialResponse.credential);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginUser(email);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const otpValue = otp.join('');
    try {
      const response = await verifyOtp(email, otpValue);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card premium-shadow rounded-3xl p-8 md:p-10 relative overflow-hidden">
          {/* Progress Shimmer */}
          {loading && (
            <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
              <div className="w-full h-full bg-primary/20 relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-primary"
                  animate={{ left: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{ width: '30%' }}
                />
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4"
            >
              <Globe className="w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              {success ? 'Welcome back!' : 'Parcel Login'}
            </h1>
            <p className="text-muted-foreground">
              {success ? 'Logging you in...' : 'Sign in to your account to continue'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <p className="text-lg font-medium text-green-600 dark:text-green-400">Authentication Successful</p>
              </motion.div>
            ) : step === 'EMAIL' ? (
              <motion.div 
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 ml-1">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                  </button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-4 text-muted-foreground font-medium">Or continue with</span></div>
                  </div>

                  <div className="flex justify-center mt-2">
                    <GoogleLogin
                      onSuccess={onGoogleSuccess}
                      onError={() => setError('Google login failed')}
                      useOneTap
                      theme="filled_black"
                      shape="pill"
                      width="350px"
                    />
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground">
                      We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
                    </p>
                    <button 
                      type="button" 
                      onClick={() => setStep('EMAIL')}
                      className="text-xs text-primary hover:underline mt-2 font-medium"
                    >
                      Change email
                    </button>
                  </div>

                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.some(d => !d)}
                    className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Account <CheckCircle2 className="w-5 h-5" /></>}
                  </button>

                  <p className="text-center text-sm text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button 
                      type="button" 
                      onClick={handleSendOtp}
                      className="text-primary hover:underline font-medium"
                    >
                      Resend
                    </button>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <p className="text-sm text-error font-medium">{error}</p>
            </motion.div>
          )}

          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/60 text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Enterprise Authentication</span>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground/60">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-foreground transition-colors">Terms of Service</a> and{' '}
          <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
