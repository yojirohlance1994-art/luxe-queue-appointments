import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, ShieldCheck, Calendar, LogIn } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, signOut } = useAuth();

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

          <nav className="flex items-center gap-1 sm:gap-3 md:gap-6">
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
            {isAdmin && (
              <Link
                to="/admin"
                className="px-2 sm:px-3 py-1.5 rounded-md text-card-foreground hover:text-primary hover:bg-accent transition-smooth font-semibold text-sm sm:text-base md:text-lg"
                activeProps={{ className: "px-2 sm:px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm sm:text-base md:text-lg" }}
              >
                Admin
              </Link>
            )}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth font-semibold text-sm"
              >
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 ml-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[120px] truncate">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-xs text-muted-foreground">Signed in as</div>
                    <div className="text-sm font-medium truncate">{user?.email}</div>
                    <div className="text-xs mt-1 inline-flex items-center gap-1 text-primary font-semibold">
                      {isAdmin ? <><ShieldCheck className="h-3 w-3" /> Admin</> : <><User className="h-3 w-3" /> Client</>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin"><ShieldCheck className="h-4 w-4 mr-2" /> Reservation Queue</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                      <Calendar className="h-4 w-4 mr-2" /> Book Appointment
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </header>
      <BookingDialog open={open} onOpenChange={setOpen} />
    </>
  );
}