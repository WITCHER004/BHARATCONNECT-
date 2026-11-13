export function BrandLogo({
  variant = 'badge', // 'badge' | 'full' | 'icon' | 'dark' | 'transparent'
  className = '',
  imgClassName = '',
}) {
  const base = import.meta.env.BASE_URL || '/';

  if (variant === 'icon') {
    return (
      <img
        src={`${base}brand/logo-icon.png`}
        alt="Bharat Connect"
        className={`object-contain rounded-sm ${className || 'w-7 h-7'}`}
      />
    );
  }

  if (variant === 'dark') {
    return (
      <img
        src={`${base}brand/logo-dark.png`}
        alt="Bharat Connect"
        className={`object-contain ${className || 'h-8 w-auto'}`}
      />
    );
  }

  if (variant === 'transparent') {
    return (
      <img
        src={`${base}brand/logo-transparent.png`}
        alt="Bharat Connect"
        className={`object-contain ${className || 'h-8 w-auto'}`}
      />
    );
  }

  if (variant === 'full') {
    return (
      <img
        src={`${base}brand/logo.png`}
        alt="Bharat Connect"
        className={`object-contain ${className || 'h-8 w-auto'}`}
      />
    );
  }

  // Default 'badge': pristine light pill with gold rim guaranteeing perfect contrast on dark or light UI
  return (
    <div
      className={`inline-flex items-center justify-center bg-white/95 hover:bg-white px-2.5 py-1 rounded-md border border-gold-foil/30 hover:border-gold-foil/60 shadow-sm transition-all duration-150 ${className}`}
    >
      <img
        src={`${base}brand/logo.png`}
        alt="Bharat Connect"
        className={`h-7 w-auto object-contain ${imgClassName}`}
      />
    </div>
  );
}

export function BrandMark({ className = 'w-7 h-7' }) {
  const base = import.meta.env.BASE_URL || '/';

  // For compact square slots (e.g. w-4 h-4, w-5 h-5)
  if (className.includes('w-4') || className.includes('w-5')) {
    return (
      <img
        src={`${base}brand/logo-icon.png`}
        alt="Bharat Connect"
        className={`object-contain rounded-[3px] ${className}`}
      />
    );
  }

  return (
    <div className="inline-flex items-center justify-center bg-white/95 rounded-md px-2 py-0.5 border border-gold-foil/30 shadow-sm">
      <img
        src={`${base}brand/logo.png`}
        alt="Bharat Connect"
        className="h-6 w-auto object-contain"
      />
    </div>
  );
}

