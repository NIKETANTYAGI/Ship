import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Menu, X, User, LayoutDashboard, LogOut, Bell, Sun, Moon, Laptop, Wallet } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-2xl border-b border-border/20 shadow-sm transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-foreground">
                PARCEL<span className="text-primary">.</span>
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <Link to="/pricing" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link to="/track" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Track Shipment</Link>
            <Link to="/international" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">International</Link>
            <Link to="/partner" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Couriers</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <div className="flex items-center bg-muted/50 rounded-full p-1 border border-border/40">
              <button 
                onClick={() => setTheme("light")} 
                className={cn("p-1.5 rounded-full transition-all", theme === "light" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme("system")} 
                className={cn("p-1.5 rounded-full transition-all", theme === "system" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <Laptop className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme("dark")} 
                className={cn("p-1.5 rounded-full transition-all", theme === "dark" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <div onClick={() => navigate('/profile')} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 cursor-pointer hover:bg-primary/20 transition-all font-bold text-sm">
                  <Wallet className="w-4 h-4 text-primary" />
                  ₹{user?.wallet || 0}
                </div>
                
                <Button onClick={() => navigate('/notifications')} variant="ghost" size="icon" className="relative group rounded-full bg-muted/30 border border-border/20">
                  <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse"></span>
                </Button>
                
                <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm" className="items-center gap-2 text-sm font-bold rounded-lg border border-border/40 hover:bg-muted/50">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
                
                <Button onClick={() => navigate('/profile')} variant="ghost" size="icon" className="rounded-full bg-muted/50 border border-border/40 flex items-center justify-center w-10 h-10 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                  <User className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate('/login')} variant="ghost" size="sm" className="hidden sm:inline-flex text-sm font-bold">Log in</Button>
            )}
            
            {user?.role === 'admin' && (
              <Button onClick={() => navigate('/compare')} className="hidden sm:inline-flex bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 font-bold rounded-xl px-6 transition-all hover:scale-105">
                Book Parcel
              </Button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors border border-border/20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6 pt-2 border-t border-border/20 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
            <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-base font-bold text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-muted/50">Pricing</Link>
            <Link to="/track" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-base font-bold text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-muted/50">Track Shipment</Link>
            <Link to="/international" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-base font-bold text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-muted/50">International</Link>
            <Link to="/partner" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-base font-bold text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-muted/50">Couriers</Link>
            <hr className="border-border/20 mx-4" />
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between px-4 py-2">
                   <div onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 font-bold cursor-pointer hover:bg-primary/20 transition-all">
                    <Wallet className="w-4 h-4" />
                    ₹{user?.wallet || 0}
                  </div>
                  <Button onClick={() => navigate('/notifications')} variant="ghost" size="icon" className="relative group rounded-full bg-muted/30 border border-border/20">
                    <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
                  </Button>
                </div>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-base font-bold text-foreground hover:text-primary transition-colors rounded-xl hover:bg-muted/50 flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-base font-bold text-foreground hover:text-primary transition-colors rounded-xl hover:bg-muted/50 flex items-center gap-3">
                  <User className="w-5 h-5" /> Profile
                </Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="px-4 py-3 text-left text-base font-bold text-red-500 hover:text-red-600 transition-colors rounded-xl hover:bg-red-500/10 flex items-center gap-3">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-base font-bold text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-muted/50">Log in</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/compare" onClick={() => setIsMenuOpen(false)} className="mx-4 mt-2 py-4 bg-primary text-primary-foreground text-center font-bold rounded-xl shadow-lg shadow-primary/20">Book Parcel</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
