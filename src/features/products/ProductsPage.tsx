import { useState, useEffect } from "react";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "../../api";
import type { Product, ProductVariant } from "../../api";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Offcanvas
  const [canvasProduct, setCanvasProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [activeVariantUid, setActiveVariantUid] = useState<string | null>(null);

  // Actions dropdown
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Create product
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [createProductName, setCreateProductName] = useState("");
  const [createProductLoading, setCreateProductLoading] = useState(false);

  // Update product
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [updateProductLoading, setUpdateProductLoading] = useState(false);

  // Delete product
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [deleteProductLoading, setDeleteProductLoading] = useState(false);

  // Create variant
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [variantName, setVariantName] = useState("");
  const [variantBillingType, setVariantBillingType] = useState("one_time");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantCurrency, setVariantCurrency] = useState("KES");
  const [createVariantLoading, setCreateVariantLoading] = useState(false);

  // Edit variant (inline in canvas)
  const [editVariant, setEditVariant] = useState<ProductVariant | null>(null);
  const [editVariantName, setEditVariantName] = useState("");
  const [editVariantBillingType, setEditVariantBillingType] = useState("");
  const [editVariantPrice, setEditVariantPrice] = useState("");
  const [editVariantCurrency, setEditVariantCurrency] = useState("");
  const [updateVariantLoading, setUpdateVariantLoading] = useState(false);

  // Delete variant
  const [deleteVariantTarget, setDeleteVariantTarget] = useState<ProductVariant | null>(null);
  const [deleteVariantLoading, setDeleteVariantLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await listProducts();
      setProducts(res.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchVariants = async (productUid: string) => {
    setVariantsLoading(true);
    try {
      const res = await listProductVariants(productUid);
      const data = res.data ?? [];
      setVariants(data);
      setActiveVariantUid(data.length > 0 ? data[0].variant_uid : null);
    } catch {
      setVariants([]);
    } finally {
      setVariantsLoading(false);
    }
  };

  const openCanvas = (product: Product) => {
    setCanvasProduct(product);
    setVariants([]);
    setActiveVariantUid(null);
    setShowCreateVariant(false);
    setEditVariant(null);
    fetchVariants(product.product_uid);
  };

  const closeCanvas = () => {
    setCanvasProduct(null);
    setVariants([]);
    setActiveVariantUid(null);
    setShowCreateVariant(false);
    setEditVariant(null);
  };

  // ── Product CRUD ─────────────────────────────────────────────────────────────

  const handleCreateProduct = async () => {
    if (!createProductName.trim()) return;
    setCreateProductLoading(true);
    try {
      await createProduct({ product_name: createProductName });
      setShowCreateProduct(false);
      setCreateProductName("");
      fetchProducts();
    } catch {
      // silent
    } finally {
      setCreateProductLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editProduct || !newProductName.trim()) return;
    setUpdateProductLoading(true);
    try {
      await updateProduct({ product_uid: editProduct.product_uid, new_product_name: newProductName });
      setEditProduct(null);
      setNewProductName("");
      fetchProducts();
    } catch {
      // silent
    } finally {
      setUpdateProductLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    setDeleteProductLoading(true);
    try {
      await deleteProduct(deleteProductTarget.product_uid);
      setDeleteProductTarget(null);
      fetchProducts();
    } catch {
      // silent
    } finally {
      setDeleteProductLoading(false);
    }
  };

  // ── Variant CRUD ─────────────────────────────────────────────────────────────

  const handleCreateVariant = async () => {
    if (!canvasProduct || !variantName.trim() || !variantPrice) return;
    setCreateVariantLoading(true);
    try {
      const res = await createProductVariant({
        product_uid: canvasProduct.product_uid,
        variant_name: variantName,
        billing_type: variantBillingType,
        variant_price: parseFloat(variantPrice),
        billing_currency: variantCurrency,
      });
      setShowCreateVariant(false);
      setVariantName("");
      setVariantBillingType("one_time");
      setVariantPrice("");
      setVariantCurrency("KES");
      await fetchVariants(canvasProduct.product_uid);
      // Select the newly created variant
      if (res.data?.variant_uid) {
        setActiveVariantUid(res.data.variant_uid);
      }
    } catch {
      // silent
    } finally {
      setCreateVariantLoading(false);
    }
  };

  const startEditVariant = (v: ProductVariant) => {
    setEditVariant(v);
    setEditVariantName(v.variant_name);
    setEditVariantBillingType(v.billing_type);
    setEditVariantPrice(String(v.billing_amount));
    setEditVariantCurrency(v.billing_currency);
  };

  const handleUpdateVariant = async () => {
    if (!editVariant || !canvasProduct) return;
    setUpdateVariantLoading(true);
    try {
      await updateProductVariant({
        variant_uid: editVariant.variant_uid,
        variant_name: editVariantName,
        billing_type: editVariantBillingType,
        variant_price: parseFloat(editVariantPrice),
        billing_currency: editVariantCurrency,
      });
      setEditVariant(null);
      await fetchVariants(canvasProduct.product_uid);
    } catch {
      // silent
    } finally {
      setUpdateVariantLoading(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!deleteVariantTarget || !canvasProduct) return;
    setDeleteVariantLoading(true);
    try {
      await deleteProductVariant(deleteVariantTarget.variant_uid);
      setDeleteVariantTarget(null);
      setEditVariant(null);
      await fetchVariants(canvasProduct.product_uid);
    } catch {
      // silent
    } finally {
      setDeleteVariantLoading(false);
    }
  };

  const activeVariant = variants.find((v) => v.variant_uid === activeVariantUid) ?? null;

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden relative">
      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[18px] font-black text-[#111B21]">Products</h1>
            <p className="text-[12px] text-[#667781] mt-0.5">
              {products.length} product{products.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button
            onClick={() => setShowCreateProduct(true)}
            className="h-9 px-4 bg-[#128C7E] text-white rounded-lg text-[12px] font-bold hover:bg-[#075E54] transition-colors"
          >
            + Create Product
          </button>
        </div>

        {/* Products table */}
        <div className="bg-white rounded-xl overflow-hidden border border-[#E9EDEF]">
          <div className="px-5 py-3 border-b border-[#E9EDEF] flex items-center justify-between">
            <span className="text-[13px] font-black text-[#111B21]">All Products</span>
            <button
              onClick={fetchProducts}
              className="text-[11px] text-[#128C7E] hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-[12px] text-[#667781]">
              Loading products…
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <p className="text-[12px] text-[#667781]">No products found.</p>
              <button
                onClick={() => setShowCreateProduct(true)}
                className="h-8 px-4 bg-[#128C7E] text-white rounded-lg text-[11px] font-bold hover:bg-[#075E54]"
              >
                Create First Product
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#F0F2F5]">
                  {["#", "Product Name", "Product UID", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-[11px] font-extrabold text-[#667781] uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr
                    key={product.product_uid}
                    className="border-t border-[#E9EDEF] hover:bg-[#F0F2F5] transition-colors"
                  >
                    <td className="px-4 py-3 text-[12px] text-[#667781]">{i + 1}</td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-[#111B21] capitalize">
                      {product.product_name}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[#667781] font-mono">
                      {product.product_uid}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === product.product_uid ? null : product.product_uid,
                            )
                          }
                          className="h-7 px-3 bg-[#F0F2F5] hover:bg-[#E9EDEF] rounded-lg text-[11px] font-bold text-[#111B21] border border-[#E9EDEF] flex items-center gap-1.5"
                        >
                          Actions <span className="text-[9px] opacity-70">▼</span>
                        </button>

                        {openDropdown === product.product_uid && (
                          <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-[#E9EDEF] z-50 w-44 py-1 text-[12px]">
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                openCanvas(product);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-[#F0F2F5] text-[#128C7E] font-semibold"
                            >
                              Product Variants
                            </button>
                            <div className="my-1 border-t border-[#E9EDEF]" />
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                setEditProduct(product);
                                setNewProductName(product.product_name);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-[#F0F2F5] text-[#111B21]"
                            >
                              Update Product
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                setDeleteProductTarget(product);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-[#F0F2F5] text-[#EF4444]"
                            >
                              Delete Product
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── Product Variants Offcanvas ────────────────────────────────────────── */}
      {canvasProduct && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/25 z-40"
            onClick={closeCanvas}
          />

          {/* Canvas panel */}
          <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col">
            {/* Canvas header */}
            <div className="px-5 py-4 border-b border-[#E9EDEF] flex items-start justify-between shrink-0 bg-[#F0F2F5]">
              <div>
                <div className="text-[14px] font-black text-[#111B21] capitalize">
                  {canvasProduct.product_name}
                </div>
                <div className="text-[10px] text-[#667781] font-mono mt-0.5">
                  {canvasProduct.product_uid}
                </div>
              </div>
              <button
                onClick={closeCanvas}
                className="w-7 h-7 rounded-lg hover:bg-[#E9EDEF] flex items-center justify-center text-[#667781]"
              >
                ✕
              </button>
            </div>

            {/* Variants toolbar */}
            <div className="px-5 py-3 border-b border-[#E9EDEF] shrink-0 flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#111B21]">
                Variants{" "}
                <span className="text-[#667781] font-normal">({variants.length})</span>
              </span>
              <button
                onClick={() => {
                  setEditVariant(null);
                  setShowCreateVariant(true);
                }}
                className="h-8 px-3 bg-[#128C7E] text-white rounded-lg text-[11px] font-bold hover:bg-[#075E54] transition-colors"
              >
                + Create Variant
              </button>
            </div>

            {/* Tabs + content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {variantsLoading ? (
                <div className="flex items-center justify-center flex-1 text-[12px] text-[#667781]">
                  Loading variants…
                </div>
              ) : variants.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                  <p className="text-[12px] text-[#667781]">No variants yet for this product.</p>
                  <button
                    onClick={() => setShowCreateVariant(true)}
                    className="h-8 px-4 bg-[#128C7E] text-white rounded-lg text-[11px] font-bold hover:bg-[#075E54]"
                  >
                    Create First Variant
                  </button>
                </div>
              ) : (
                <>
                  {/* Tab bar */}
                  <div className="flex overflow-x-auto border-b border-[#E9EDEF] px-2 shrink-0 bg-white">
                    {variants.map((v) => (
                      <button
                        key={v.variant_uid}
                        onClick={() => {
                          setActiveVariantUid(v.variant_uid);
                          setEditVariant(null);
                        }}
                        className={[
                          "py-2.5 px-3.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors border-b-2 capitalize",
                          activeVariantUid === v.variant_uid
                            ? "text-[#128C7E] border-[#128C7E]"
                            : "text-[#667781] border-transparent hover:text-[#111B21]",
                        ].join(" ")}
                      >
                        {v.variant_name}
                      </button>
                    ))}
                  </div>

                  {/* Active variant detail */}
                  {activeVariant && (
                    <div className="flex-1 overflow-y-auto p-5">
                      {editVariant?.variant_uid === activeVariant.variant_uid ? (
                        /* ── Edit form ── */
                        <div className="flex flex-col gap-3">
                          <div className="text-[13px] font-black text-[#111B21] mb-1">
                            Edit Variant
                          </div>

                          <label className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-[#667781]">
                              Variant Name
                            </span>
                            <input
                              value={editVariantName}
                              onChange={(e) => setEditVariantName(e.target.value)}
                              className="h-9 px-3 border border-[#E9EDEF] rounded-lg text-[12px] focus:outline-none focus:border-[#128C7E]"
                            />
                          </label>

                          <label className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-bold text-[#667781]">
                              Billing Type
                            </span>
                            <select
                              value={editVariantBillingType}
                              onChange={(e) => setEditVariantBillingType(e.target.value)}
                              className="h-9 px-3 border border-[#E9EDEF] rounded-lg text-[12px] focus:outline-none focus:border-[#128C7E] bg-white"
                            >
                              <option value="one_time">One Time</option>
                              <option value="recurring">Recurring</option>
                              <option value="usage">Usage</option>
                            </select>
                          </label>

                          <div className="flex gap-2">
                            <label className="flex-1 flex flex-col gap-1.5">
                              <span className="text-[11px] font-bold text-[#667781]">Price</span>
                              <input
                                type="number"
                                min="0"
                                value={editVariantPrice}
                                onChange={(e) => setEditVariantPrice(e.target.value)}
                                className="h-9 px-3 border border-[#E9EDEF] rounded-lg text-[12px] focus:outline-none focus:border-[#128C7E]"
                              />
                            </label>
                            <label className="w-24 flex flex-col gap-1.5">
                              <span className="text-[11px] font-bold text-[#667781]">Currency</span>
                              <input
                                value={editVariantCurrency}
                                maxLength={5}
                                onChange={(e) =>
                                  setEditVariantCurrency(e.target.value.toUpperCase())
                                }
                                className="h-9 px-3 border border-[#E9EDEF] rounded-lg text-[12px] focus:outline-none focus:border-[#128C7E] uppercase"
                              />
                            </label>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleUpdateVariant}
                              disabled={updateVariantLoading}
                              className="flex-1 h-9 bg-[#128C7E] text-white rounded-lg text-[12px] font-bold hover:bg-[#075E54] disabled:opacity-50"
                            >
                              {updateVariantLoading ? "Saving…" : "Save Changes"}
                            </button>
                            <button
                              onClick={() => setEditVariant(null)}
                              className="h-9 px-4 border border-[#E9EDEF] rounded-lg text-[12px] text-[#667781] hover:bg-[#F0F2F5]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── Variant detail view ── */
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#F0F2F5] rounded-xl p-3">
                              <div className="text-[10px] font-extrabold text-[#667781] uppercase tracking-wide mb-1">
                                Variant Name
                              </div>
                              <div className="text-[13px] font-bold text-[#111B21] capitalize">
                                {activeVariant.variant_name}
                              </div>
                            </div>
                            <div className="bg-[#F0F2F5] rounded-xl p-3">
                              <div className="text-[10px] font-extrabold text-[#667781] uppercase tracking-wide mb-1">
                                Billing Type
                              </div>
                              <div className="text-[13px] font-bold text-[#111B21] capitalize">
                                {activeVariant.billing_type.replace(/_/g, " ")}
                              </div>
                            </div>
                            <div className="bg-[#E9F7F4] rounded-xl p-3">
                              <div className="text-[10px] font-extrabold text-[#128C7E] uppercase tracking-wide mb-1">
                                Price
                              </div>
                              <div className="text-[15px] font-black text-[#075E54]">
                                {activeVariant.billing_amount.toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-[#F0F2F5] rounded-xl p-3">
                              <div className="text-[10px] font-extrabold text-[#667781] uppercase tracking-wide mb-1">
                                Currency
                              </div>
                              <div className="text-[13px] font-bold text-[#111B21]">
                                {activeVariant.billing_currency}
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#F0F2F5] rounded-xl p-3">
                            <div className="text-[10px] font-extrabold text-[#667781] uppercase tracking-wide mb-1">
                              Variant UID
                            </div>
                            <div className="text-[11px] font-mono text-[#667781] break-all">
                              {activeVariant.variant_uid}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => startEditVariant(activeVariant)}
                              className="flex-1 h-9 border border-[#128C7E] text-[#128C7E] rounded-lg text-[12px] font-bold hover:bg-[#E9F7F4] transition-colors"
                            >
                              Edit Variant
                            </button>
                            <button
                              onClick={() => setDeleteVariantTarget(activeVariant)}
                              className="h-9 px-4 border border-[#EF4444] text-[#EF4444] rounded-lg text-[12px] font-bold hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Close dropdown on outside click ──────────────────────────────────── */}
      {openDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {/* Create Product */}
      {showCreateProduct && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl">
            <div className="font-black text-[15px] text-[#111B21]">Create Product</div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-[#667781]">Product Name</span>
              <input
                autoFocus
                value={createProductName}
                onChange={(e) => setCreateProductName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProduct()}
                placeholder="e.g. gps tracker plan"
                className="h-10 px-3 border border-[#E9EDEF] rounded-xl text-[13px] focus:outline-none focus:border-[#128C7E]"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleCreateProduct}
                disabled={createProductLoading || !createProductName.trim()}
                className="flex-1 h-10 bg-[#128C7E] text-white rounded-xl text-[13px] font-bold hover:bg-[#075E54] disabled:opacity-50"
              >
                {createProductLoading ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowCreateProduct(false);
                  setCreateProductName("");
                }}
                className="h-10 px-5 border border-[#E9EDEF] rounded-xl text-[13px] text-[#667781] hover:bg-[#F0F2F5]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Product */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl">
            <div className="font-black text-[15px] text-[#111B21]">Update Product</div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-[#667781]">New Product Name</span>
              <input
                autoFocus
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateProduct()}
                className="h-10 px-3 border border-[#E9EDEF] rounded-xl text-[13px] focus:outline-none focus:border-[#128C7E]"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleUpdateProduct}
                disabled={updateProductLoading || !newProductName.trim()}
                className="flex-1 h-10 bg-[#128C7E] text-white rounded-xl text-[13px] font-bold hover:bg-[#075E54] disabled:opacity-50"
              >
                {updateProductLoading ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditProduct(null);
                  setNewProductName("");
                }}
                className="h-10 px-5 border border-[#E9EDEF] rounded-xl text-[13px] text-[#667781] hover:bg-[#F0F2F5]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product */}
      {deleteProductTarget && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl">
            <div className="font-black text-[15px] text-[#111B21]">Delete Product</div>
            <p className="text-[12px] text-[#667781]">
              Deleting{" "}
              <span className="font-semibold text-[#111B21] capitalize">
                {deleteProductTarget.product_name}
              </span>{" "}
              will also remove all its variants. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteProduct}
                disabled={deleteProductLoading}
                className="flex-1 h-10 bg-[#EF4444] text-white rounded-xl text-[13px] font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {deleteProductLoading ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setDeleteProductTarget(null)}
                className="h-10 px-5 border border-[#E9EDEF] rounded-xl text-[13px] text-[#667781] hover:bg-[#F0F2F5]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Variant */}
      {showCreateVariant && canvasProduct && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl">
            <div>
              <div className="font-black text-[15px] text-[#111B21]">Create Variant</div>
              <div className="text-[11px] text-[#667781] mt-0.5 capitalize">
                for: {canvasProduct.product_name}
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-[#667781]">Variant Name</span>
              <input
                autoFocus
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="e.g. monthly plan"
                className="h-10 px-3 border border-[#E9EDEF] rounded-xl text-[13px] focus:outline-none focus:border-[#128C7E]"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-[#667781]">Billing Type</span>
              <select
                value={variantBillingType}
                onChange={(e) => setVariantBillingType(e.target.value)}
                className="h-10 px-3 border border-[#E9EDEF] rounded-xl text-[13px] focus:outline-none focus:border-[#128C7E] bg-white"
              >
                <option value="one_time">One Time</option>
                <option value="recurring">Recurring</option>
                <option value="usage">Usage</option>
              </select>
            </label>

            <div className="flex gap-2">
              <label className="flex-1 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-[#667781]">Price</span>
                <input
                  type="number"
                  min="0"
                  value={variantPrice}
                  onChange={(e) => setVariantPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-10 px-3 border border-[#E9EDEF] rounded-xl text-[13px] focus:outline-none focus:border-[#128C7E]"
                />
              </label>
              <label className="w-24 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-[#667781]">Currency</span>
                <input
                  value={variantCurrency}
                  maxLength={5}
                  onChange={(e) => setVariantCurrency(e.target.value.toUpperCase())}
                  placeholder="KES"
                  className="h-10 px-3 border border-[#E9EDEF] rounded-xl text-[13px] focus:outline-none focus:border-[#128C7E] uppercase"
                />
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateVariant}
                disabled={createVariantLoading || !variantName.trim() || !variantPrice}
                className="flex-1 h-10 bg-[#128C7E] text-white rounded-xl text-[13px] font-bold hover:bg-[#075E54] disabled:opacity-50"
              >
                {createVariantLoading ? "Creating…" : "Create Variant"}
              </button>
              <button
                onClick={() => setShowCreateVariant(false)}
                className="h-10 px-5 border border-[#E9EDEF] rounded-xl text-[13px] text-[#667781] hover:bg-[#F0F2F5]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Variant */}
      {deleteVariantTarget && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl">
            <div className="font-black text-[15px] text-[#111B21]">Delete Variant</div>
            <p className="text-[12px] text-[#667781]">
              Delete variant{" "}
              <span className="font-semibold text-[#111B21] capitalize">
                {deleteVariantTarget.variant_name}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteVariant}
                disabled={deleteVariantLoading}
                className="flex-1 h-10 bg-[#EF4444] text-white rounded-xl text-[13px] font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {deleteVariantLoading ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setDeleteVariantTarget(null)}
                className="h-10 px-5 border border-[#E9EDEF] rounded-xl text-[13px] text-[#667781] hover:bg-[#F0F2F5]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
