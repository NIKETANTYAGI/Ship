import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  User, 
  Phone, 
  Hash, 
  Home, 
  Briefcase, 
  Heart, 
  LayoutGrid,
  Loader2,
  ShieldCheck,
  Zap,
  Sparkles
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { addAddress, getAddresses, updateAddress } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

export default function AddressFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pincode: "",
    address: "",
    type: "Home",
    isDefault: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      const fetchAddress = async () => {
        try {
          const uAddresses = await getAddresses();
          const all = Array.isArray(uAddresses) ? uAddresses : [];
          const found = all.find((a: any) => String(a.id) === id);
          if (found) {
            setFormData({
              name: found.name || "",
              phone: found.phone || "",
              pincode: found.pincode || "",
              address: found.address || "",
              type: found.type || "Home",
              isDefault: found.isDefault || false
            });
          } else {
            showToast("Address not found", "error");
            navigate('/profile/addresses');
          }
        } catch (err) {
          showToast("Failed to load address", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchAddress();
    }
  }, [id, isEdit]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Entity name required";
    if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = "10-digit link required";
    if (!/^\d{6}$/.test(formData.pincode.trim())) newErrors.pincode = "6-digit code required";
    if (!formData.address.trim()) newErrors.address = "Coordinates required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await updateAddress(id, formData);
        showToast("Node configuration updated", "success");
      } else {
        await addAddress(formData);
        showToast("New node registered successfully", "success");
      }
      navigate('/profile/addresses');
    } catch (err) {
      showToast("Sync failure", "error");
    } finally {
      setSaving(false);
    }
  };

  const types = [
    { label: "Home", icon: <Home className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/10" },
    { label: "Office", icon: <Briefcase className="w-5 h-5" />, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Parents", icon: <Heart className="w-5 h-5" />, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Other", icon: <LayoutGrid className="w-5 h-5" />, color: "text-indigo-500", bg: "bg-indigo-500/10" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full -mr-1/2 pointer-events-none"></div>
      
      <Navbar />

      <main className="flex-1 pt-32 pb-32 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          
          <button 
            onClick={() => navigate('/profile/addresses')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[10px] uppercase tracking-[0.3em]">Back to Lexicon</span>
          </button>

          <div className="mb-12">
            <div className="flex items-center gap-3 text-primary mb-2">
               <Zap className="w-4 h-4 fill-current" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">{isEdit ? "Reconfiguration" : "Registration"} Phase</span>
            </div>
            <h1 className="text-5xl font-heading font-black text-foreground tracking-tighter">
              {isEdit ? "Update Node" : "Register Node"}
            </h1>
            <p className="text-muted-foreground font-bold text-lg mt-2 leading-relaxed">
              {isEdit ? "Adjust the operational parameters for this location." : "Initialize a new endpoint for your logistics mesh."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <Card className="p-10 bg-card/60 backdrop-blur-xl border-border/40 rounded-[3rem] shadow-2xl relative overflow-hidden glass-card">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="space-y-10">
                
                {/* Type Selection */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Designation Label</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {types.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t.label })}
                        className={cn(
                          "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all gap-3 relative overflow-hidden group",
                          formData.type === t.label 
                            ? "border-primary bg-primary/10 shadow-xl" 
                            : "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/60"
                        )}
                      >
                        {formData.type === t.label && (
                          <div className="absolute top-2 right-2">
                             <Sparkles className="w-3 h-3 text-primary" />
                          </div>
                        )}
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", t.bg, t.color)}>
                          {t.icon}
                        </div>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", formData.type === t.label ? "text-primary" : "text-muted-foreground")}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-8 pt-10 border-t border-border/10">
                  <div className="space-y-3 sm:col-span-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Full Entity Name
                    </Label>
                    <Input 
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className={cn("h-16 bg-muted/20 border-border/40 rounded-2xl font-black text-lg focus:ring-primary/20", errors.name && "border-red-500/50 bg-red-500/5")}
                    />
                    {errors.name && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> Secure Link (Phone)
                    </Label>
                    <Input 
                      placeholder="10 digit number"
                      maxLength={10}
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className={cn("h-16 bg-muted/20 border-border/40 rounded-2xl font-black text-lg focus:ring-primary/20", errors.phone && "border-red-500/50 bg-red-500/5")}
                    />
                    {errors.phone && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.phone}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5" /> Sector Code (Pincode)
                    </Label>
                    <Input 
                      placeholder="6 digit code"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      className={cn("h-16 bg-muted/20 border-border/40 rounded-2xl font-black text-lg focus:ring-primary/20", errors.pincode && "border-red-500/50 bg-red-500/5")}
                    />
                    {errors.pincode && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.pincode}</p>}
                  </div>

                  <div className="space-y-3 sm:col-span-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> Full Coordinates
                    </Label>
                    <textarea 
                      placeholder="House No, Building, Street, Area..."
                      rows={4}
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className={cn(
                        "w-full px-5 py-4 bg-muted/20 border border-border/40 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg placeholder:text-muted-foreground/40",
                        errors.address && "border-red-500/50 bg-red-500/5"
                      )}
                    />
                    {errors.address && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.address}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-10 border-t border-border/10">
                  <div 
                    onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                    className={cn(
                      "w-14 h-8 rounded-full transition-all relative cursor-pointer",
                      formData.isDefault ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted-foreground/20"
                    )}
                  >
                     <div className={cn("absolute top-1 w-6 h-6 rounded-full bg-background transition-all shadow-md", formData.isDefault ? "left-7" : "left-1")}></div>
                  </div>
                  <Label className="font-black text-foreground cursor-pointer flex items-center gap-2 tracking-tight">
                    Set as Master Routing Node
                    <ShieldCheck className="w-4 h-4 text-primary opacity-40" />
                  </Label>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                type="button"
                onClick={() => navigate('/profile/addresses')}
                variant="outline"
                className="flex-1 h-20 rounded-3xl font-black border-border/60 hover:bg-muted/50 uppercase tracking-[0.2em] text-xs"
              >
                Abort
              </Button>
              <Button 
                type="submit"
                disabled={saving}
                className="flex-[2] h-20 bg-foreground text-background hover:opacity-90 rounded-3xl shadow-2xl font-black transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center uppercase tracking-[0.2em] text-xs"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Synchronizing...</>
                ) : (
                  <><Save className="w-5 h-5 mr-3" /> {isEdit ? "Update Node" : "Confirm Node"}</>
                )}
              </Button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
