import { Siren } from "lucide-react";

export default function FloatingActions() {
  const handleEmergency = () => {
    // Emergency hotline number
    window.location.href = 'tel:102'; // National Emergency Number in India
  };

  const handleWhatsApp = () => {
    // WhatsApp support number
    const phoneNumber = '919999999999'; // Replace with actual support number
    const message = encodeURIComponent('Hi, I need assistance with WombTo18');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      <div className="fixed bottom-22 right-6 z-[60]">
        <button 
          onClick={handleEmergency}
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition hover:scale-110 active:scale-95"
          title="Emergency Care - Call 102"
        >
          <Siren className="h-5 w-5" />
          <span className="absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold shadow-lg group-hover:block">Emergency Care</span>
        </button>
      </div>
      <div className="fixed bottom-6 right-6 z-[60]">
        <button 
          onClick={handleWhatsApp}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition hover:scale-110 active:scale-95"
          title="WhatsApp Support"
        >
          <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793 0-.853.448-1.273.607-1.446.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.088.275.073.376-.044.101-.117.433-.506.548-.68.116-.174.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"></path>
          </svg>
        </button>
      </div>
    </>
  );
}