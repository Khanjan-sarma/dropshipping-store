"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { formatINR, paiseToRupees } from "@/lib/money";
import { CATEGORIES } from "@/lib/config";

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  compareAt: number | null;
  costPrice: number;
  stock: number;
  category: string;
  active: boolean;
};

type FormState = {
  slug: string;
  title: string;
  description: string;
  images: string[];
  priceRupees: string;
  compareAtRupees: string;
  costPriceRupees: string;
  stock: string;
  category: string;
  active: boolean;
};

const emptyForm: FormState = {
  slug: "",
  title: "",
  description: "",
  images: [],
  priceRupees: "",
  compareAtRupees: "",
  costPriceRupees: "",
  stock: "999",
  category: CATEGORIES[0].slug,
  active: true,
};

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      description: p.description,
      images: p.images,
      priceRupees: String(paiseToRupees(p.price)),
      compareAtRupees: p.compareAt != null ? String(paiseToRupees(p.compareAt)) : "",
      costPriceRupees: String(paiseToRupees(p.costPrice)),
      stock: String(p.stock),
      category: p.category,
      active: p.active,
    });
    setError("");
    setShowForm(true);
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Upload failed");
          break;
        }
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  async function save() {
    setError("");
    if (!form.title || !form.slug || !form.priceRupees || !form.costPriceRupees) {
      setError("Title, slug, price and cost price are required.");
      return;
    }
    setSaving(true);
    const payload = {
      slug: form.slug,
      title: form.title,
      description: form.description,
      images: form.images,
      priceRupees: Number(form.priceRupees),
      compareAtRupees: form.compareAtRupees ? Number(form.compareAtRupees) : null,
      costPriceRupees: Number(form.costPriceRupees),
      stock: Number(form.stock || "999"),
      category: form.category,
      active: form.active,
    };
    const url = editing
      ? `/api/admin/products/${editing.id}`
      : "/api/admin/products";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save.");
      return;
    }
    setShowForm(false);
    load();
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.title}"? If it has orders it will be deactivated instead.`))
      return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="btn-primary">
          + Add product
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading…</p>
      ) : products.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No products yet. Add your first product.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={p.images[0] || "/placeholder.svg"}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {p.title}
                        </div>
                        <div className="text-xs text-gray-400">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatINR(p.price)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatINR(p.costPrice)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="card my-8 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? "Edit product" : "Add product"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Title</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f,
                      title,
                      slug:
                        editing || f.slug
                          ? f.slug
                          : title
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-|-$/g, ""),
                    }));
                  }}
                />
              </div>
              <div>
                <label className="label">Slug</label>
                <input
                  className="input"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Selling price (₹)</label>
                <input
                  className="input"
                  type="number"
                  value={form.priceRupees}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priceRupees: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">MRP / compare-at (₹, optional)</label>
                <input
                  className="input"
                  type="number"
                  value={form.compareAtRupees}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, compareAtRupees: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Cost price (₹, admin only)</label>
                <input
                  className="input"
                  type="number"
                  value={form.costPriceRupees}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, costPriceRupees: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Stock</label>
                <input
                  className="input"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea
                  className="input min-h-28"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Images</label>
                <div className="flex flex-wrap gap-2">
                  {form.images.map((url) => (
                    <div
                      key={url}
                      className="relative h-20 w-20 overflow-hidden rounded-lg border"
                    >
                      <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                      <button
                        onClick={() => removeImage(url)}
                        className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/60 text-white"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:bg-gray-50"
                  >
                    {uploading ? "…" : "+ Upload"}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  First image is the primary. Uploads go to Cloudinary.
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                />
                Active (visible in store)
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Save product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
