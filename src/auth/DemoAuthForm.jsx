import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

/*
  Demo sign in / sign up form (DEMO_AUTH). Validates the shape of the details,
  then signs the visitor in. The password is never checked or stored.
*/

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const inputCls = (err) =>
  `w-full h-11 px-3 rounded-[10px] bg-surface-1 border text-[15px] text-fg placeholder:text-fg-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 ${
    err ? 'border-negative' : 'border-line-strong hover:border-fg-3'
  }`;

export default function DemoAuthForm({ mode = 'signin' }) {
  const { demoSignIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (signup && !name.trim()) err.name = 'Please enter your full name';
    if (!EMAIL.test(email.trim())) err.email = 'Please enter a valid email address';
    if (signup ? password.length < 8 : !password) err.password = signup ? 'Use at least 8 characters' : 'Please enter your password';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    // a short pause so it reads like a real sign-in
    setTimeout(() => demoSignIn({ name: signup ? name : '', email }), 450);
  };

  return (
    <form onSubmit={submit} noValidate className="text-left flex flex-col gap-4">
      {signup && (
        <div>
          <label htmlFor="demo-name" className="block text-sm text-fg-2 mb-2">Full name</label>
          <input id="demo-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name} className={inputCls(errors.name)} />
          {errors.name && <p className="mt-2 text-sm text-negative">{errors.name}</p>}
        </div>
      )}
      <div>
        <label htmlFor="demo-email" className="block text-sm text-fg-2 mb-2">Email</label>
        <input id="demo-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com" aria-invalid={!!errors.email} className={inputCls(errors.email)} />
        {errors.email && <p className="mt-2 text-sm text-negative">{errors.email}</p>}
      </div>
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="demo-password" className="block text-sm text-fg-2">Password</label>
          {!signup && <span className="text-xs text-fg-3">Forgot password? Contact the secretariat</span>}
        </div>
        <div className="relative">
          <input id="demo-password" type={show ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'}
            value={password} onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password} className={`${inputCls(errors.password)} pr-11`} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-1 top-1 w-9 h-9 rounded-lg flex items-center justify-center text-fg-3 hover:text-fg cursor-pointer">
            {show ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>
        {errors.password && <p className="mt-2 text-sm text-negative">{errors.password}</p>}
      </div>
      <button type="submit" disabled={busy} className="btn-primary h-11 text-sm mt-2">
        {busy ? (signup ? 'Creating account…' : 'Signing in…') : signup ? 'Create account' : 'Sign in'}
      </button>
      <p className="text-xs text-fg-3 text-center">Preview sign-in · no password is stored</p>
    </form>
  );
}
