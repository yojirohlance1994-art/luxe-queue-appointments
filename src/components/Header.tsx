import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-card border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between gap-4 h-20">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img src={logo} alt="Glammee logo" width={48} height={48} className="h-10 w-10 sm:h-12 sm:w-12" />
            <span className="font-display italic text-xl sm:text-2xl md:text-3xl font-bold text-primary">
              Glammee
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <Link
              to="/"
              className="px-2 sm:px-3 py-1.5 rounded-md text-card-foreground hover:text-primary hover:bg-accent transition-smooth font-semibold text-sm sm:text-base md:text-lg"
              activeOptions={{ exact: true }}
              activeProps={{ className: "px-2 sm:px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm sm:text-base md:text-lg" }}
            >
              Home
            </Link>
            <Link
              to="/services"
              className="px-2 sm:px-3 py-1.5 rounded-md text-card-foreground hover:text-primary hover:bg-accent transition-smooth font-semibold text-sm sm:text-base md:text-lg"
              activeProps={{ className: "px-2 sm:px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm sm:text-base md:text-lg" }}
            >
              Services
            </Link>
            <Link
              to="/about"
              className="px-2 sm:px-3 py-1.5 rounded-md text-card-foreground hover:text-primary hover:bg-accent transition-smooth font-semibold text-sm sm:text-base md:text-lg"
              activeProps={{ className: "px-2 sm:px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm sm:text-base md:text-lg" }}
            >
              About
            </Link>
          </nav>
        </div>
      </header>
      <BookingDialog open={open} onOpenChange={setOpen} />
    </>
  );
}