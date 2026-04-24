import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  RefreshCw, 
  ArrowLeft, 
  Calendar, 
  User, 
  HelpCircle,
  Clock,
  ChevronRight
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTracking } from "@/lib/api";
import { LoadingState } from "@/components/shared/feedback/LoadingState";
import { useToast } from "@/context/ToastContext";

export default function DelhiveryFailedPage() {
  const { awb } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const data = await getTracking(awb || "AWB123456789IN");
        setTrackingData(data);
      } catch (err) {
        console.error("Failed to fetch tracking data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [awb]);

  const handleReschedule = () => {
    showToast("Rescheduling request sent to Delhivery!", "success");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Retrieving shipment history..." />
        </main>
      </div>
    );
  }

  const failureStatus = "Delivery Attempt Failed";
  const failureReason = "Recipient Not Available";
  const lastAttemptDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const lastAttemptTime = "04:30 PM";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Back Navigation */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm">Back to Tracking</span>
          </button>

          {/* Header Section */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 mb-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="w-10 h-10" />
              </div>
              
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                  <Clock className="w-3 h-3" /> Attempted {lastAttemptTime}
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-2">
                  {failureStatus}
                </h1>
                <p className="text-lg text-muted-foreground font-medium max-w-lg">
                  We tried delivering your shipment <span className="text-foreground font-bold">{awb}</span>, but could not complete it.
                </p>
              </div>
              
              <div className="w-full md:w-auto">
                <Button 
                  onClick={handleReschedule}
                  className="w-full md:w-auto h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <RefreshCw className="w-5 h-5 mr-3" /> Reschedule Delivery
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Failure Reason Card */}
              <Card className="p-8 bg-card border-border rounded-[2rem] shadow-sm">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Why did this happen?
                </h3>
                
                <div className="flex items-start gap-5 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <div className="w-12 h-12 bg-card rounded-xl shadow-sm flex items-center justify-center text-red-500 shrink-0 border border-red-500/20">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xl text-red-500 mb-1">{failureReason}</h4>
                    <p className="text-red-500/70 font-medium leading-relaxed">
                      Our delivery partner reached the address on <span className="font-bold">{lastAttemptDate}</span>, but no one was available to receive the package.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Attempt Location: {trackingData?.current_location || "Delivery Address"}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Next Planned Attempt: Contact Support for Updates</span>
                  </div>
                </div>
              </Card>

              {/* Action Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <button className="flex items-center justify-between p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-all group group-hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">Call Delhivery</p>
                      <p className="text-xs font-medium text-muted-foreground">Direct Support Line</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button className="flex items-center justify-between p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-all group group-hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">Update Address</p>
                      <p className="text-xs font-medium text-muted-foreground">Correct details if any</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>

            {/* Right Column: Support */}
            <div className="space-y-6">
              <Card className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mb-16 -mr-16"></div>
                <h3 className="font-heading font-bold text-lg mb-4 relative z-10">Need Assistance?</h3>
                <p className="text-slate-400 text-sm font-medium mb-6 relative z-10">
                  Our PARCEL support team can help you coordinate with Delhivery for faster resolution.
                </p>
                <div className="space-y-3 relative z-10">
                  <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 h-12 rounded-xl border-none">
                    Raise a Ticket
                  </Button>
                  <Button variant="ghost" className="w-full text-slate-300 hover:text-white hover:bg-slate-800/50 h-12 rounded-xl">
                    Chat with Us
                  </Button>
                </div>
              </Card>

              <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <h4 className="text-amber-500 font-bold text-sm mb-2">Important Note</h4>
                <p className="text-amber-500/70 text-xs font-medium leading-relaxed">
                  Delhivery usually makes 3 attempts before returning the shipment to the sender. Please reschedule at the earliest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
