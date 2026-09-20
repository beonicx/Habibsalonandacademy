export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/918528666441"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-full shadow-xl hover:bg-green-600 transition-all duration-300 hover:scale-105"
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
        alt="WhatsApp"
        className="w-6 h-6"
      />

      <span className="hidden md:block font-medium">
        Chat with Us
      </span>

      {/* Tooltip */}
      <span className="absolute right-16 opacity-0 group-hover:opacity-100 bg-black text-white text-xs px-2 py-1 rounded transition">
        WhatsApp
      </span>
    </a>
  );
}