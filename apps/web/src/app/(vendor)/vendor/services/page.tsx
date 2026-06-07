"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inr } from "@/lib/format";

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export default function VendorServices() {
  const [list, setList] = useState<Service[] | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("KG");
  const [adding, setAdding] = useState(false);

  const load = () => {
    apiGet<Service[] | { services: Service[] }>("/vendors/me/services")
      .then((d) => setList(Array.isArray(d) ? d : d.services))
      .catch(() => setList([]));
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim() || !price) {
      toast.error("Enter service name and price");
      return;
    }
    setAdding(true);
    try {
      await apiPost("/vendors/me/services", {
        name: name.trim(),
        price: Number(price),
        unit,
      });
      toast.success("Service added");
      setName("");
      setPrice("");
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    const prev = list;
    setList((l) => l?.filter((s) => s.id !== id) ?? null);
    try {
      await apiDelete(`/vendors/me/services/${id}`);
      toast.success("Removed");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setList(prev);
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage what you offer and your prices
        </p>
      </header>

      <div className="rounded-2xl bg-card border shadow-sm p-5 mb-6 max-w-3xl">
        <h2 className="font-semibold mb-4">Add new service</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_140px_auto] gap-3">
          <Input
            placeholder="Service name (e.g. Wash & Fold)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="number"
            min={0}
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KG">per KG</SelectItem>
              <SelectItem value="PIECE">per Piece</SelectItem>
              <SelectItem value="PAIR">per Pair</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={add} disabled={adding} className="gap-2">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </Button>
        </div>
      </div>

      <div className="rounded-2xl bg-card border shadow-sm overflow-hidden max-w-3xl">
        {!list ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No services yet
          </div>
        ) : (
          <ul className="divide-y">
            {list.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {inr(s.price)} / {s.unit?.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() => remove(s.id)}
                  className="w-9 h-9 grid place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
