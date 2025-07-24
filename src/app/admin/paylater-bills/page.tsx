"use client";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch("/api/paylater");
    const data = await res.json();
    setBills(data);
  };

  const markPaid = async (id: string) => {
    if (!date) return alert("Select date");
    await fetch("/api/paylater", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, paymentMethod: method, paidAt: date }),
    });
    load();
  };

  const filtered = bills.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.id.toLowerCase().includes(term) ||
      (b.billingName || "").toLowerCase().includes(term) ||
      (b.phone || "").includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-700">Pay Later Bills</h1>
      <p className="text-sm text-gray-600">
        Search and update pending pay later bills. Select payment method and
        date before marking paid.
      </p>
      <div className="max-w-sm">
        <Input
          placeholder="Search by name, phone or bill ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid gap-4">
        {filtered.map((b) => (
          <Card key={b.id} className="border-l-4 border-green-600 shadow-sm">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  {b.billingName || "Unnamed"}
                </span>
                <span className="text-sm text-gray-500">
                  {format(new Date(b.createdAt), "yyyy-MM-dd")}
                </span>
              </CardTitle>
              <CardDescription>
                Bill #{b.id} • {b.phone || "No phone"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <ul className="text-sm list-disc pl-5">
                {b.items.map((it, i) => (
                  <li key={i} className="">
                    {it.service} - {it.variant} - ₹{it.amountAfter.toFixed(2)}
                  </li>
                ))}
              </ul>
              <div className="font-semibold text-right text-blue-700 mt-2">
                Total: ₹{b.totalAfter.toFixed(2)}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="border px-2 py-1 rounded flex-1 min-w-[120px]"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 min-w-[150px]"
              />
              <Button onClick={() => markPaid(b.id)}>Update</Button>
            </CardFooter>
          </Card>
        ))}
        {filtered.length === 0 && <p>No pending bills</p>}
      </div>
    </div>
  );
}
