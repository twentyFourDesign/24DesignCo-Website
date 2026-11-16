/** Floating "Chat on WhatsApp" button. On phones it sits above the sticky booking bar so the two never overlap. */
export function whatsappLink(phone: string, text = "Hi 24 Design Co., I have an idea I would like to discuss.") {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : "";
}

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M16.04 3C9.4 3 4 8.33 4 14.9c0 2.35.7 4.54 1.9 6.39L4 29l7.93-1.85a12.2 12.2 0 0 0 4.1.7C22.67 27.85 28 22.52 28 15.95 28 9.38 22.67 3 16.04 3Zm0 22.68c-1.31 0-2.6-.24-3.8-.7l-.27-.1-4.7 1.1 1.12-4.48-.18-.28a9.6 9.6 0 0 1-1.54-5.32c0-5.38 4.4-9.75 9.82-9.75 5.4 0 9.8 4.37 9.8 9.75 0 5.4-4.4 9.78-9.8 9.78Zm5.37-7.3c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.24-.45-2.37-1.45-.88-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.49.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.52.08-.79.37-.27.3-1.03 1-1.03 2.44s1.06 2.83 1.2 3.03c.15.2 2.08 3.15 5.04 4.42.7.3 1.25.48 1.68.62.7.22 1.35.19 1.85.12.57-.09 1.75-.71 2-1.4.24-.68.24-1.27.17-1.4-.07-.12-.27-.2-.57-.34Z" />
    </svg>
  );
}

export default function WhatsAppButton({ phone }: { phone: string }) {
  const href = whatsappLink(phone);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp (opens in a new tab)"
      className="site-chrome fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy md:bottom-6 md:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
