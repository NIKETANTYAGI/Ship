import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, DollarSign, Download, Filter } from "lucide-react";

export default function CashOnDeliveryPortal() {
  const codTransactions = [
    { id: "TXN10293", awb: "AWB123456789IN", date: "24 Oct 2024", amount: 1540.00, courier: "Delhivery", status: "REMitted" },
    { id: "TXN10294", awb: "AWB987654321IN", date: "25 Oct 2024", amount: 890.00, courier: "Blue Dart", status: "PENDING" },
    { id: "TXN10295", awb: "AWB456789123IN", date: "25 Oct 2024", amount: 2100.00, courier: "XpressBees", status: "IN_TRANSIT" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">COD & Remittance</h1>
              <p className="text-muted-foreground mt-1 font-medium">Track your Cash on Delivery collections and settlements.</p>
            </div>

            <Button variant="outline" className="font-semibold bg-card border-border shadow-sm">
              <Download className="w-4 h-4 mr-2" /> Download Report
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0 shadow-lg rounded-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-background/10 rounded-full blur-[40px]"></div>
              <div className="relative z-10">
                <div className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">Early Remittance Available</div>
                <div className="font-heading font-extrabold text-3xl mb-1">₹4,290.00</div>
                <div className="text-xs text-white/60 mb-4">Pending settlement from couriers (2-3 days left)</div>
                <Button className="w-full bg-card text-indigo-900 dark:text-indigo-300 hover:bg-muted font-bold border-0 shadow-sm">
                  Get Funds Instantly (1% Fee)
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card border border-border/50 shadow-sm rounded-2xl flex flex-col justify-center border-l-4 border-l-emerald-500">
              <div className="flex gap-4 items-center mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                  <ArrowDownLeft className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Remitted</div>
                  <div className="font-heading font-extrabold text-2xl text-foreground">₹28,450.00</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-emerald-600">Successfully transferred to bank (This Month)</div>
            </Card>

            <Card className="p-6 bg-card border border-border/50 shadow-sm rounded-2xl flex flex-col justify-center border-l-4 border-l-amber-500">
              <div className="flex gap-4 items-center mb-4">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">COD Returns (RTO Value)</div>
                  <div className="font-heading font-extrabold text-2xl text-foreground">₹1,240.00</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-amber-600">Lost revenue due to customer rejections</div>
            </Card>
          </div>

          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border/40 flex justify-between items-center">
              <h3 className="font-heading font-bold text-lg">Detailed Transactions</h3>
              <Button variant="ghost" size="sm" className="font-bold text-primary"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            </div>
            
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider py-4 pl-6">Transaction ID</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider py-4">Associated AWB</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider py-4">Courier</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider py-4">Delivery Date</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider py-4">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider py-4 pr-6 text-right">Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codTransactions.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-sm pl-6">{txn.id}</TableCell>
                    <TableCell className="text-primary font-bold hover:underline cursor-pointer">{txn.awb}</TableCell>
                    <TableCell className="font-semibold">{txn.courier}</TableCell>
                    <TableCell className="text-muted-foreground font-medium">{txn.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-bold uppercase text-[10px] tracking-wider ${
                        txn.status === 'REMitted' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : txn.status === 'PENDING' 
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground pr-6 text-base">₹{txn.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

        </div>
      </main>
    </div>
  );
}
