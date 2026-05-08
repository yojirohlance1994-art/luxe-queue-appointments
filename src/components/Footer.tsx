import logo from "@/assets/logo.png";
import { Phone, Smartphone, Facebook, Instagram, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-24">
      <div className="container mx-auto px-4 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Glammee" width={48} height={48} className="h-12 w-12" />
            <span className="font-display text-2xl font-bold">Glammee</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            A neighborhood hair, nail & beauty salon dedicated to honest care and real results.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4 tracking-wide">CONTACT</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +63 2 8 1234 567</li>
            <li className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> +63 991 222 3344</li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" /> 123 Beauty Lane, Manila</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4 tracking-wide">INFORMATION</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/services" className="hover:underline">Services</Link></li>
            <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
            <li><Link to="/admin" className="hover:underline opacity-70">Staff Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4 tracking-wide">FOLLOW US</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook</li>
            <li className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-foreground/10 py-4 text-center text-xs opacity-80">
        © {new Date().getFullYear()} Glammee Salon. All rights reserved.
      </div>
    </footer>
  );
}