import { get } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { RequestOptions } from "../types";
import type { VebaStatistics } from "../types";

export function getVebaStatistics(
  opts?: RequestOptions,
): Promise<VebaStatistics> {
  return get<VebaStatistics>(ENDPOINTS.VEBA.STATISTICS, opts).then(res => res.data);
}
