export interface Product {
  product_uid: string;
  product_name: string;
}

export interface CreateProductRequest {
  product_name: string;
}

export interface CreateProductResponse {
  product_uid: string;
  product_name: string;
}

export interface UpdateProductRequest {
  product_uid: string;
  new_product_name: string;
}

export interface ProductVariant {
  variant_uid: string;
  variant_name: string;
  billing_type: string;
  billing_amount: number;
  billing_currency: string;
}

export interface CreateVariantRequest {
  product_uid: string;
  variant_name: string;
  billing_type: string;
  variant_price: number;
  billing_currency: string;
}

export interface CreateVariantResponse {
  variant_uid: string;
  product_uid: string;
  variant_name: string;
  billing_type: string;
  billing_amount: number;
  billing_currency: string;
}

export interface UpdateVariantRequest {
  variant_uid: string;
  variant_name: string;
  billing_type: string;
  variant_price: number;
  billing_currency: string;
}
