import { InstagramIcon, INSTAGRAM_URL } from './InstagramIcon';
import { WhatsAppIcon, WHATSAPP_URL } from './WhatsAppPopup';

/* Two small icon links on the bottom-left: WhatsApp and Instagram. No pop-up cards. */
const LINKS = [
  { href: WHATSAPP_URL, label: 'Chat with Bharat Connect on WhatsApp', Icon: WhatsAppIcon },
  { href: INSTAGRAM_URL, label: 'Bharat Connect on Instagram', Icon: InstagramIcon },
];

export default function InstagramPopup() {
  return (
    <nav
      aria-label="Bharat Connect on social media"
      className="fixed left-3 sm:left-5 z-40 flex flex-col gap-2"
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      {LINKS.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="w-10 h-10 rounded-full bg-surface-0/90 backdrop-blur-sm border border-line-strong text-fg-2 hover:text-gold-text hover:border-gold-foil/60 flex items-center justify-center transition-colors duration-150 [-webkit-tap-highlight-color:transparent]"
        >
          <Icon className="w-[18px] h-[18px]" />
        </a>
      ))}
    </nav>
  );
}
