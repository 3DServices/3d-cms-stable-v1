import { useState, useEffect } from "react";

import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api";
import type { Product } from "../../api";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

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
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-[#E9EDEF] z-50 w-44 py-1 text-[12px]">
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
              cannot be undone.
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
    </div>
  );
}
