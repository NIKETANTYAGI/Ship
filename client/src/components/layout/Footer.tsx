import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a0b0d] text-white/70 pt-24 pb-12 transition-colors font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                PARCEL<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed">
              India's Unified Shipping Hub. Compare, book, and track shipments across 10+ partners from a single intelligence platform.
            </p>
            <div className="flex items-center gap-4">
              <Link to="#" className="text-white/40 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
              <Link to="#" className="text-white/40 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></Link>
              <Link to="#" className="text-white/40 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></Link>
              <Link to="#" className="text-white/40 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li><Link to="/pricing" className="hover:text-white transition-colors">Compare Rates</Link></li>
              <li><Link to="/track" className="hover:text-white transition-colors">Live Tracking</Link></li>
              <li><Link to="/international" className="hover:text-white transition-colors">International Shipping</Link></li>
              <li><Link to="/partner" className="hover:text-white transition-colors">Courier Partners</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Prohibited Items</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Packaging Guidelines</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Developer API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Stay Updated</h4>
            <p className="text-white/50 text-sm mb-4">Get shipping tips and exclusive partner discounts.</p>
            <div className="flex">
              <input type="email" placeholder="Your email address" className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm rounded-l-lg px-4 py-2 w-full focus:outline-none focus:border-primary transition-all" />
              <button className="bg-primary hover:bg-primary/90 text-white rounded-r-lg px-4 flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">© 2026 PARCEL Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
