import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Plus, 
  Search, 
  MoreVertical, 
  Home, 
  Briefcase, 
  Heart, 
  Edit2, 
  Trash2, 
  ChevronRight,
  ArrowLeft,
  Settings2,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAddresses, deleteAddress } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { LoadingState } from "@/components/shared/feedback/LoadingState";
import { EmptyState } from "@/components/shared/feedback/EmptyState";
import { cn } from "@/lib/utils";

export default function AddressBookPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data || []);
    } catch (err) {
      showToast("Failed to load addresses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await deleteAddress(id);
      showToast("Address deleted successfully", "success");
      fetchAddresses();
    } catch (err) {
      showToast("Failed to delete address", "error");
    }
  };

  const filteredAddresses = addresses.filter(addr => 
    addr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home': return <Home className="w-5 h-5 text-primary" />;
      case 'office': return <Briefcase className="w-5 h-5 text-amber-500" />;
      case 'parents': return <Heart className="w-5 h-5 text-rose-500" />;
      default: return <MapPin className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full -ml-1/2 pointer-events-none"></div>
      
      <Navbar />

      <main className="flex-1 pt-32 pb-32 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-black text-[10px] uppercase tracking-[0.3em]">Back to Hub</span>
              </button>
              <div className="space-y-1">
                <h1 className="text-5xl font-heading font-black text-foreground tracking-tighter">
                  Address Lexicon
                </h1>
                <p className="text-muted-foreground font-bold text-lg">
                  Secure and manage your frequent logistics endpoints.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/profile/addresses/add')}
              className="h-16 px-10 bg-foreground text-background hover:opacity-90 rounded-2xl shadow-2xl font-black transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-3 uppercase tracking-widest text-xs"
            >
              <Plus className="w-6 h-6" /> Register New Node
            </Button>
          </div>

          {/* Search */}
          <div className="mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/5 blur-2xl group-focus-within:bg-primary/10 transition-colors"></div>
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Query by name, address, or designation..." 
                className="h-20 pl-16 bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl font-black text-xl placeholder:text-muted-foreground focus:ring-primary/20 transition-all glass-card"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20">
              <LoadingState message="Synchronizing address nodes..." />
            </div>
          ) : filteredAddresses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAddresses.map((addr) => (
                <Card 
                  key={addr.id} 
                  className="group relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden glass-card"
                  onClick={() => navigate(`/profile/addresses/edit/${addr.id}`)}
                >
                  {/* Floating Decor */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-muted/40 rounded-2xl flex items-center justify-center border border-border/40 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all shadow-inner shadow-black/5">
                        {getIcon(addr.type)}
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-2xl text-foreground tracking-tight">{addr.type}</h3>
                        {addr.isDefault && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 uppercase text-[9px] font-black px-3 py-1 rounded-lg mt-1 tracking-widest">Master Node</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/addresses/edit/${addr.id}`);
                        }}
                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/20 backdrop-blur-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(addr.id, e)}
                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 backdrop-blur-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Designated Recipient</p>
                      <p className="font-black text-lg text-foreground">{addr.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Neural Link (Contact)</p>
                      <p className="font-bold text-foreground opacity-80">{addr.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Node Coordinates</p>
                      <p className="text-sm font-bold text-foreground/60 leading-relaxed line-clamp-2">
                        {addr.address}, {addr.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border/10 flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-black text-primary flex items-center gap-2 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                      <ShieldCheck className="w-3.5 h-3.5" /> SECURE LOCATION
                    </span>
                    <div className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-card/30 border-2 border-dashed border-border/40 rounded-[3rem] p-20 text-center glass-card">
              <EmptyState 
                title={searchQuery ? "Matrix Mismatch" : "No Address Nodes Found"} 
                description={searchQuery ? "Our lookup engines couldn't find a matching node. Refine your query." : "Construct your logistics network by registering your first endpoint below."} 
              />
              {!searchQuery && (
                <Button 
                  onClick={() => navigate('/profile/addresses/add')}
                  className="mt-12 h-16 px-12 rounded-2xl font-black bg-foreground text-background shadow-2xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                >
                  <Plus className="w-5 h-5 mr-3" /> Initialize First Node
                </Button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
