import { Globe, Mail, Twitter, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#1da1f2] to-[#066395] text-white pt-10 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-6 w-6" />
              <span className="font-bold text-lg">TravelGenie AI</span>
            </div>
            <p className="text-white/90 text-base">Your AI-powered travel companion for<br />creating unforgettable journeys.</p>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-2">Quick Links</h4>
            <ul>
              <li><a href="/" className="hover:underline text-white/90">Home</a></li>
            </ul>
          </div>
          {/* Contact Us */}
          <div>
            <h4 className="font-bold mb-2">Contact Us</h4>
            <div className="flex items-center gap-2 text-white/90">
              <Mail className="h-5 w-5" />
              <span>support@travelgenie.ai</span>
            </div>
          </div>
          {/* Follow Us */}
          <div>
            <h4 className="font-bold mb-2">Follow Us</h4>
            <div className="flex gap-4 mt-1">
              <a href="#" className="hover:text-blue-200"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-blue-200"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-blue-200"><Facebook className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <hr className="border-blue-200/40 mb-4" />
        <p className="text-center text-white/80 text-sm">© {new Date().getFullYear()} TravelGenie AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;