import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/context/ToastContext";
import { getUserProfile, updateUserProfile, getAddresses, deleteAddress } from "@/lib/api";
import { Wallet, MessageCircle, Gift, Trophy, ShieldCheck, CreditCard, Loader2, MapPin, Plus, Trash2, User, Star, Lock, Search, Heart, Briefcase, ChevronRight, Edit2, Home, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/shared/feedback/LoadingState";
import { ErrorState } from "@/components/shared/feedback/ErrorState";

const formatWalletBalance = (balance: number) => {
  if (balance >= 10000000) {
    return `${(balance / 10000000).toFixed(2)} Cr`;
  } else if (balance >= 100000) {
    return `${(balance / 100000).toFixed(2)} L`;
  } else if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)} k`;
  }
  return balance.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Address state
  const [addresses, setAddresses] = useState<any[]>([]);

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(0);
  const [rechargeAmt, setRechargeAmt] = useState("1000");
  const [isRecharging, setIsRecharging] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [uProfile, uAddresses] = await Promise.all([
        getUserProfile(),
        getAddresses()
      ]);
      setProfile(uProfile);
      setName(uProfile.name || "");
      setEmail(uProfile.email || "");
      setWalletBalance(uProfile.wallet || 0);
      setAddresses(Array.isArray(uAddresses) ? uAddresses : []);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateUserProfile({ name, email });
      showToast("Profile updated successfully!", "success");
      setProfile({ ...profile, name, email });
    } catch (err: any) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill all password fields", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    try {
      setIsChangingPassword(true);
      // Mock API call to update password
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast("Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(err.message || "Failed to change password", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRecharge = () => {
    const amt = parseInt(rechargeAmt) || 0;
    if (amt < 100) {
      showToast("Minimum recharge is ₹100", "error");
      return;
    }
    setIsRecharging(true);
    setTimeout(() => {
      setIsRecharging(false);
      setWalletBalance(prev => prev + amt);
      setRechargeAmt("");
      showToast(`Wallet Recharged! ₹${amt} added.`, "success");
    }, 1500);
  };
  
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      showToast("Address deleted successfully", "success");
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      showToast(err.message || "Deletion failed", "error");
    }
  };
  
  const filteredAddresses = (Array.isArray(addresses) ? addresses : []).filter(addr => 
    addr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAddressIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home': return <Home className="w-5 h-5 text-primary" />;
      case 'office': return <Briefcase className="w-5 h-5 text-amber-500" />;
      case 'parents': return <Heart className="w-5 h-5 text-rose-500" />;
      default: return <MapPin className="w-5 h-5 text-indigo-500" />;
    }
  };

  const referralLink = "https://p2p.in/ref/RAHUL99";

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <LoadingState message="Loading your profile..." />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <ErrorState message={error} onRetry={fetchData} title="Error Loading Profile" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-12 pb-32 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 mt-12">
            <div className="space-y-2">
              <h1 className="text-4xl font-heading font-black text-foreground tracking-tighter">Your Profile</h1>
              <p className="text-muted-foreground font-medium text-lg max-w-md">Manage your personal information, addresses, and account settings.</p>
            </div>
            
            <div className="flex p-1.5 bg-card/50 backdrop-blur-xl border border-border/40 shadow-sm rounded-xl">
              <button 
                onClick={() => setActiveTab('profile')}
                className={cn("px-6 py-2.5 text-sm font-semibold rounded-lg transition-all", activeTab === 'profile' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/30")}
              >
                Profile Details
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={cn("px-6 py-2.5 text-sm font-semibold rounded-lg transition-all", activeTab === 'addresses' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/30")}
              >
                Saved Addresses
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Col: Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {activeTab === 'profile' ? (
                <>
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-card border-border shadow-sm rounded-2xl flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                         <Trophy className="w-6 h-6" />
                      </div>
                      <div className="text-3xl font-heading font-bold text-foreground mb-1">{profile?.shipments_count || 0}</div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Shipments</div>
                    </Card>
                    <Card className="p-6 bg-card border-border shadow-sm rounded-2xl flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                         <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="text-3xl font-heading font-bold text-foreground mb-1">₹{(profile?.money_saved || 0).toFixed(0)}</div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Saved</div>
                    </Card>
                    <Card className="p-6 bg-card border-border shadow-sm rounded-2xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-1 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-4">
                         <Star className="w-6 h-6" />
                      </div>
                      <div className="text-3xl font-heading font-bold text-foreground mb-1">Gold</div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Tier</div>
                    </Card>
                  </div>

                  {/* Profile Editor */}
                  <Card className="p-8 bg-card border-border shadow-md rounded-2xl">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-xl text-foreground">Personal Information</h3>
                          <p className="text-sm font-medium text-muted-foreground mt-1">Update your name and email address</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1 rounded-lg">KYC Verified</Badge>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Full Name</Label>
                          <Input value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Phone Number</Label>
                          <div className="relative">
                            <Input value={profile?.phone || ""} disabled className="h-12 bg-muted/50 rounded-xl text-muted-foreground" />
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                          </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-sm font-semibold">Email Address</Label>
                          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12 rounded-xl" />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-6 border-t border-border/50 mt-8">
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="h-12 px-8 rounded-xl font-semibold">
                          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Change Password Section */}
                  <Card className="p-8 bg-card border-border shadow-md rounded-2xl">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/50">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <KeyRound className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-xl text-foreground">Change Password</h3>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Ensure your account is using a long, random password</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-sm font-semibold">Current Password</Label>
                          <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">New Password</Label>
                          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Confirm New Password</Label>
                          <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-12 rounded-xl" />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-6 border-t border-border/50 mt-8">
                        <Button onClick={handleChangePassword} disabled={isChangingPassword} className="h-12 px-8 rounded-xl font-semibold">
                          {isChangingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : "Update Password"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative flex-1 w-full group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search addresses..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-card" 
                      />
                    </div>
                    <Button onClick={() => navigate('/profile/addresses/add')} className="h-12 px-6 rounded-xl font-semibold flex items-center gap-2">
                       <Plus className="w-4 h-4" /> Add New Address
                    </Button>
                  </div>

                  {filteredAddresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {(Array.isArray(filteredAddresses) ? filteredAddresses : []).map((addr: any) => (
                        <Card 
                          key={addr.id} 
                          onClick={() => navigate(`/profile/addresses/edit/${addr.id}`)}
                          className="p-6 bg-card border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                                {getAddressIcon(addr.type)}
                              </div>
                              <div>
                                <h4 className="font-bold text-base text-foreground capitalize">{addr.type}</h4>
                                {addr.isDefault && (
                                  <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] uppercase font-bold py-0.5 px-2">Default</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/profile/addresses/edit/${addr.id}`); }}
                                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary rounded-md hover:bg-muted"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">{addr.name}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{addr.address}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
                       <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                       <h3 className="font-bold text-xl mb-2">No addresses found</h3>
                       <p className="text-muted-foreground mb-6">Add an address to start booking shipments.</p>
                       <Button onClick={() => navigate('/profile/addresses/add')} className="h-12 px-6 rounded-xl font-semibold">
                          Add Address
                       </Button>
                    </div>
                  )}
                </div>
                </>
              )}

            </div>

            {/* Right Col: Wallet & Referrals */}
            <div className="space-y-8">
              
              <Card className="p-8 bg-slate-900 dark:bg-card text-white border-none shadow-xl rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none"></div>
                 
                 <div className="flex items-center gap-2 mb-2 relative z-10 text-white/70 font-semibold uppercase tracking-wider text-xs">
                   <Wallet className="w-4 h-4" /> Wallet Balance
                 </div>
                 
                 <div className="text-5xl font-heading font-black relative z-10 mb-8">
                   ₹{formatWalletBalance(walletBalance)}
                 </div>

                 <div className="relative z-10 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                   <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                     <Plus className="w-4 h-4" /> Add Money
                   </div>
                   <div className="grid grid-cols-3 gap-2 mb-4">
                      {["500", "1000", "2000"].map(amt => (
                        <button 
                          key={amt} 
                          onClick={() => setRechargeAmt(amt)}
                          className={cn("py-2 rounded-lg text-sm font-bold border transition-colors", rechargeAmt === amt ? "bg-white text-slate-900 border-white" : "border-white/20 hover:bg-white/10")}
                        >
                          ₹{amt}
                        </button>
                      ))}
                   </div>
                   <div className="flex relative items-center gap-2">
                     <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-white/50">₹</span>
                        <Input 
                          type="number"
                          value={rechargeAmt}
                          onChange={e => setRechargeAmt(e.target.value)}
                          placeholder="00" 
                          className="pl-7 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus-visible:ring-white/30 font-bold" 
                        />
                     </div>
                     <Button onClick={handleRecharge} disabled={isRecharging || !rechargeAmt} className="h-12 px-6 rounded-xl bg-white text-slate-900 hover:bg-white/90 font-bold">
                       {isRecharging ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                     </Button>
                   </div>
                 </div>
              </Card>

              {/* Refer and Earn */}
              <Card className="p-8 bg-card border-border shadow-sm rounded-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">Refer & Earn</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">Get ₹200 for each friend</p>
                  </div>
                </div>

                <div className="bg-muted/50 p-1.5 rounded-xl flex items-center border border-border mb-6">
                  <Input readOnly value={referralLink} className="h-10 bg-transparent border-0 text-xs font-mono font-bold focus-visible:ring-0 px-3 cursor-default" />
                  <Button onClick={() => { navigator.clipboard.writeText(referralLink); showToast("Link Copied!", "success"); }} variant="secondary" size="sm" className="h-9 px-4 rounded-lg font-bold">
                    Copy
                  </Button>
                </div>

                <Button onClick={() => window.open(`https://wa.me/?text=Shipping%20made%20easy.%20Use%20PARCEL%20to%20get%20best%20rates!%20${referralLink}`)} className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5 fill-current" /> Share on WhatsApp
                </Button>
              </Card>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
