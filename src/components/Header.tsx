import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
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
import { Calendar, LogIn, LogOut, ShieldCheck, Sparkles, User, UserPlus } from "lucide-react";

export function Header() {
  const { isAuthenticated, isAdmin, user, signOut } = useAuth();

  const publicLinkClass =
    "px-2 sm:px-3 py-1.5 rounded-md text-card-foreground hover:text-primary hover:bg-accent transition-smooth font-semibold text-sm sm:text-base md:text-lg";
  const activePublic = {
    className:
      "px-2 sm:px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm sm:text-base md:text-lg",
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border/40">
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between gap-4 h-20">
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img
            src={logo}
            alt="Glammee logo"
            width={48}
            height={48}
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <span className="font-display italic text-xl sm:text-2xl md:text-3xl font-bold text-primary">
            Glammee{" "}
            {isAdmin && (
              <span className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
                Admin
              </span>
            )}
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {!isAdmin && (
            <>
              <Link
                to="/"
                className={publicLinkClass}
                activeOptions={{ exact: true }}
                activeProps={activePublic}
              >
                Home
              </Link>
              <Link to="/services" className={publicLinkClass} activeProps={activePublic}>
                Services
              </Link>
              <Link
                to="/team"
                className={`hidden md:inline-flex ${publicLinkClass}`}
                activeProps={activePublic}
              >
                Our Team
              </Link>
              <Link
                to="/work"
                className={`hidden md:inline-flex ${publicLinkClass}`}
                activeProps={activePublic}
              >
                Our Work
              </Link>
              <Link to="/reviews" className={publicLinkClass} activeProps={activePublic}>
                Reviews
              </Link>
              <Link
                to="/about"
                className={`hidden lg:inline-flex ${publicLinkClass}`}
                activeProps={activePublic}
              >
                About
              </Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin" className={publicLinkClass} activeProps={activePublic}>
              Admin Suite
            </Link>
          )}

          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
          >
            <Link to="/booking">
              <Calendar className="h-4 w-4 mr-1.5" /> Book Now
            </Link>
          </Button>

          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-1.5" /> Login
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-secondary text-secondary-foreground hover:opacity-90"
              >
                <Link to="/signup">
                  <UserPlus className="h-4 w-4 mr-1.5" /> Sign Up
                </Link>
              </Button>
            </div>
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
                    {isAdmin ? (
                      <>
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" /> Client
                      </>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <ShieldCheck className="h-4 w-4 mr-2" /> Admin Suite
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/booking">
                        <Calendar className="h-4 w-4 mr-2" /> Book Appointment
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/reviews">
                        <Sparkles className="h-4 w-4 mr-2" /> Leave a Review
                      </Link>
                    </DropdownMenuItem>
                  </>
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
  );
}
