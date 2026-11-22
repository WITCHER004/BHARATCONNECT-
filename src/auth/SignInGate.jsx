import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';

/*
  Shows children only to signed-in visitors. Everyone else sees a sign-in panel in its place.
  `title` and `reason` describe what they are signing in for.
*/
export default function SignInGate({ title, reason, children }) {
  const { user, ready } = useAuth();

  if (user) return children;
  // until Firebase has restored the session, don't flash the sign-in panel at a signed-in visitor
  if (!ready) return <div className="min-h-[320px]" aria-busy="true" />;

  return (
    <div className="px-4 sm:px-0">
      <div className="max-w-xl mx-auto surface-card rounded-2xl p-8 sm:p-10 text-center">
        <span className="ornament justify-center" aria-hidden="true">
          <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" fill="currentColor" /></svg>
        </span>
        <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-medium text-fg">{title}</h2>
        <p className="mt-3 text-[15px] text-fg-2 leading-relaxed">{reason}</p>

        <div className="mt-8 text-left">
          <AuthForm mode="signin" />
        </div>

        <p className="mt-8 text-sm text-fg-3 leading-relaxed">
          Your account keeps your accreditations, passes, and deal rooms securely in one place.
        </p>
      </div>
    </div>
  );
}
