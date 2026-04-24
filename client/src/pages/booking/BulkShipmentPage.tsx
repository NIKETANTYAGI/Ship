import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { bulkBookShipments } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function BulkShipmentPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "parsing" | "parsed">("idle");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    setUploadStatus("parsing");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Simple CSV Parser logic
        const lines = text.split("\n").filter(l => l.trim().length > 0);
        const headers = lines[0].split(",");
        
        const data = lines.slice(1).map(line => {
          const values = line.split(",");
          return {
             pickup_address: { pincode: values[0], name: values[1], phone: values[2], full_address: values[3], city: values[4], state: values[5] },
             delivery_address: { pincode: values[6], name: values[7], phone: values[8], full_address: values[9], city: values[10], state: values[11] },
             weight_grams: parseInt(values[12]) || 500
          };
        });
        
        setShipments(data);
        setUploadStatus("parsed");
      } catch (err) {
        console.error("Parse Error:", err);
        setUploadStatus("idle");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkBook = async () => {
    setIsProcessing(true);
    try {
      await bulkBookShipments(shipments);
      navigate("/shipments?status=draft");
    } catch (err) {
      console.error("Bulk booking failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-extrabold text-foreground mb-2">Bulk Shipment Import</h1>
            <p className="text-muted-foreground font-medium">Upload a CSV file to create multiple shipment drafts instantly.</p>
          </div>

          {uploadStatus === "idle" ? (
            <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5 p-12 text-center rounded-3xl">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">Upload CSV Template</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                Make sure your file follows our standard CSV format for seamless processing.
              </p>
              <input type="file" id="bulk-upload" className="hidden" accept=".csv" onChange={handleFileUpload} />
              <label htmlFor="bulk-upload">
                <Button className="rounded-full px-8 py-6 font-bold text-lg shadow-lg cursor-pointer">
                  <span>Choose File</span>
                </Button>
              </label>
              <div className="mt-8 flex items-center justify-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                 <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> CSV Only</span>
                 <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Max 100 Rows</span>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="bg-card border-border shadow-md rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">{file?.name}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[10px] font-extrabold">{shipments.length} VALID ROWS</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setUploadStatus("idle")} className="text-rose-500 hover:bg-rose-500/10 rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="sticky top-0 bg-card border-b border-border z-10">
                        <tr>
                          <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Pickup</th>
                          <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Delivery</th>
                          <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Weight</th>
                          <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {shipments.map((s, i) => (
                          <tr key={i} className="hover:bg-muted/5">
                            <td className="p-4">
                              <div className="font-bold">{s.pickup_address.name}</div>
                              <div className="text-[10px] text-muted-foreground">{s.pickup_address.pincode}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold">{s.delivery_address.name}</div>
                              <div className="text-[10px] text-muted-foreground">{s.delivery_address.pincode}</div>
                            </td>
                            <td className="p-4 font-medium">{s.weight_grams}g</td>
                            <td className="p-4">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </Card>

              <div className="flex items-center justify-between bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-card rounded-xl shadow-sm flex items-center justify-center text-primary border border-border">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Confirm Batch Creation</h4>
                    <p className="text-sm text-muted-foreground font-medium">Ready to create {shipments.length} draft shipments in your account.</p>
                  </div>
                </div>
                <Button onClick={handleBulkBook} disabled={isProcessing} className="rounded-full px-10 py-6 font-bold text-lg shadow-xl gap-2">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Proceed</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
