import { get, post } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse, RequestOptions } from "../types";
import type {
  Product,
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  ProductVariant,
  CreateVariantRequest,
  CreateVariantResponse,
  UpdateVariantRequest,
} from "../types";

export function listProducts(opts?: RequestOptions): Promise<ApiResponse<Product[]>> {
  return get<Product[]>(ENDPOINTS.PRODUCTS.LIST, opts);
}

export function createProduct(
  payload: CreateProductRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<CreateProductResponse>> {
  return post<CreateProductResponse>(ENDPOINTS.PRODUCTS.CREATE, { data: payload }, opts);
}

export function updateProduct(
  payload: UpdateProductRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<CreateProductResponse>> {
  return post<CreateProductResponse>(ENDPOINTS.PRODUCTS.UPDATE, { data: payload }, opts);
}

export function deleteProduct(
  productUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<null>> {
  return post<null>(ENDPOINTS.PRODUCTS.DELETE, { data: { product_uid: productUid } }, opts);
}

export function listProductVariants(
  productUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<ProductVariant[]>> {
  return get<ProductVariant[]>(`${ENDPOINTS.PRODUCTS.VARIANT_LIST}/${productUid}`, opts);
}

export function createProductVariant(
  payload: CreateVariantRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<CreateVariantResponse>> {
  return post<CreateVariantResponse>(ENDPOINTS.PRODUCTS.VARIANT_CREATE, { data: payload }, opts);
}

export function updateProductVariant(
  payload: UpdateVariantRequest,
  opts?: RequestOptions,
): Promise<ApiResponse<CreateVariantResponse>> {
  return post<CreateVariantResponse>(ENDPOINTS.PRODUCTS.VARIANT_UPDATE, { data: payload }, opts);
}

export function deleteProductVariant(
  variantUid: string,
  opts?: RequestOptions,
): Promise<ApiResponse<null>> {
  return post<null>(ENDPOINTS.PRODUCTS.VARIANT_DELETE, { data: { variant_uid: variantUid } }, opts);
}
