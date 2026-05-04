import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { Menu, X } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass =
    "text-foreground/90 hover:text-primary transition-smooth font-medium";
  const activeClass = "text-primary";

  return (
    <>
      <header className="sticky top-0 z-40 bg-card border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Glammee logo" width={48} height={48} className="h-12 w-12" />
            <span className="font-display italic text-2xl md:text-3xl font-bold text-primary">
              Glammee
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-card-foreground hover:text-primary transition-smooth font-semibold text-lg" activeOptions={{ exact: true }} activeProps={{ className: "text-primary font-semibold text-lg" }}>
              Home
            </Link>
            <Link to="/services" className="text-card-foreground hover:text-primary transition-smooth font-semibold text-lg" activeProps={{ className: "text-primary font-semibold text-lg" }}>
              Services
            </Link>
            <Link to="/about" className="text-card-foreground hover:text-primary transition-smooth font-semibold text-lg" activeProps={{ className: "text-primary font-semibold text-lg" }}>
              About
            </Link>
          </nav>

          <button
            aria-label="Toggle menu"
            className="md:hidden text-card-foreground p-2"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border/40 bg-card/95 backdrop-blur">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link to="/" onClick={() => setMenuOpen(false)} className={linkClass}>Home</Link>
              <Link to="/services" onClick={() => setMenuOpen(false)} className={linkClass}>Services</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className={linkClass}>About</Link>
              <Button onClick={() => { setMenuOpen(false); setOpen(true); }} className="bg-gradient-primary text-primary-foreground">
                Book Now
              </Button>
            </div>
          </div>
        )}
      </header>
      <BookingDialog open={open} onOpenChange={setOpen} />
    </>
  );
}