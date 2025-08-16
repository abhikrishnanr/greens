"use client";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  History,
  Search,
  Calendar as CalendarIcon,
  Wallet,
  IndianRupee,
  Phone,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface BillItem {
  service: string;
  variant: string;
  amountAfter: number;
}
interface Bill {
  id: string;
  createdAt: string;
  paymentMethod: string;
  items: BillItem[];
  totalAfter: number;
  billingName?: string | null;
  phone?: string | null;
}

export default function PayLaterBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [method, setMethod] = useState("cash");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  const showBanner = (type: "success" | "error", msg: string) => {
    setBanner({ type, msg });
    setTimeout(() => setBanner(null), 2600);
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/paylater");
      const data = await res.json();
      setBills(data || []);
    } catch {
      showBanner("error", "Failed to load pay later bills.");
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async (id: string) => {
    if (!date) {
      showBanner("error", "Please select a payment date before updating.");
      return;
    }
    try {
      await fetch("/api/paylater", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentMethod: method, paidAt: date }),
      });
      showBanner("success", "Bill updated successfully.");
      load();
    } catch {
      showBanner("error", "Update failed. Please try again.");
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return bills;
    return bills.filter((b) =>
      b.id.toLowerCase().includes(term) ||
      (b.billingName || "").toLowerCase().includes(term) ||
      (b.phone || "").includes(term)
    );
  }, [bills, search]);

  const totals = useMemo(() => {
    const count = filtered.length;
    const outstanding = filtered.reduce((s, b) => s + b.totalAfter, 0);
    const services = filtered.reduce((s, b) => s + b.items.length, 0);
    return { count, outstanding, services };
  }, [filtered]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-8 text-white">
          <div className="flex items-start sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-100">
                <History className="h-6 w-6" />
                <span className="uppercase tracking-wider text-xs">Finance</span>
              </div>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Pay Later Bills</h1>
              <p className="mt-2 text-emerald-50 max-w-2xl">
                Search and settle outstanding pay-later invoices. Choose payment method & date before marking paid.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">Bills</div>
                <div className="text-2xl font-bold">{totals.count}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">Services</div>
                <div className="text-2xl font-bold">{totals.services}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-xs">Outstanding</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  {totals.outstanding.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone or bill ID…"
                className="pl-10 h-10 bg-white/10 border-white/30 text-white placeholder:text-white/70"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm flex items-center gap-2">
                <Wallet className="h-4 w-4 text-white/80" />
                <span className="text-white/90">Method</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="h-10 rounded-md border border-white/30 bg-white/10 px-3 text-white outline-none focus:ring-2 focus:ring-white/40"
              >
                <option value="cash" className="text-black">Cash</option>
                <option value="upi" className="text-black">UPI</option>
                <option value="card" className="text-black">Card</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-white/80" />
                <span className="text-white/90">Paid at</span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 bg-white/10 border-white/30 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="container mx-auto px-4">
        {banner && (
          <div
            className={`-mt-4 mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              banner.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
            role="status"
          >
            {banner.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span>{banner.msg}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid gap-4">
            {[0, 1, 2].map((k) => (
              <Card key={k} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="mt-2 h-3 w-24 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 w-2/3 bg-gray-200 rounded" />
                  <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded" />
                </CardContent>
                <CardFooter>
                  <div className="h-9 w-24 bg-gray-200 rounded" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <History className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-900">No pending bills</h3>
            <p className="text-sm text-gray-500">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((b) => (
              <Card key={b.id} className="border shadow-sm rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-600" />
                      <span className="text-lg font-semibold text-gray-900">
                        {b.billingName || "Unnamed"}
                      </span>
                      {b.phone && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-600">
                          <Phone className="h-3.5 w-3.5" />
                          {b.phone}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(b.createdAt), "yyyy-MM-dd")}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Bill <span className="font-medium text-gray-700">#{b.id}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  <ul className="text-sm list-disc pl-5 text-gray-700">
                    {b.items.map((it, i) => (
                      <li key={i}>
                        {it.service} - {it.variant} — ₹{it.amountAfter.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <span className="text-sm text-gray-600">Total</span>
                    <div className="text-lg font-bold text-emerald-700 flex items-center gap-1">
                      <IndianRupee className="h-5 w-5" />
                      {b.totalAfter.toFixed(2)}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Method</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="border px-2 py-1 rounded min-w-[120px]"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Paid at</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="min-w-[150px]"
                    />
                  </div>

                  <Button
                    onClick={() => markPaid(b.id)}
                    className="ml-auto"
                  >
                    Mark Paid
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
