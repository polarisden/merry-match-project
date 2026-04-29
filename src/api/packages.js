import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const headers = config.headers ?? {};
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token")?.trim() : "";
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  config.headers = headers;
  return config;
});

/**
 * GET /api/packages
 * 200 = JSON array (ว่าง = [])
 * PackageDto: id, icon, name, merryLimit, createdAt, updatedAt
 */
export async function getPackages() {
  const { data } = await api.get("/api/packages");
  return Array.isArray(data) ? data : [];
}

function buildPackageFormData(values) {
  const formData = new FormData();
  formData.append("name", String(values?.name ?? ""));
  formData.append("merryLimit", String(values?.merryLimit ?? ""));
  formData.append("priceSatang", String(values?.priceSatang ?? 0));
  formData.append("canSeeLikers", String(values?.canSeeLikers ?? false));
  formData.append("sortOrder", String(values?.sortOrder ?? 0));

  const rawDetails = Array.isArray(values?.details) ? values.details : [];
  const details = rawDetails.map((item, index) => ({
    description: String(item?.description ?? item?.text ?? ""),
    sortOrder: item?.sortOrder ?? index,
  }));
  formData.append("details", JSON.stringify(details));

  if (values?.iconFile) {
    formData.append("icon", values.iconFile);
  }

  return formData;
}

/**
 * POST /api/packages
 * body = FormData (name, merryLimit, priceSatang, canSeeLikers, sortOrder, icon?, details(JSON string array))
 */
export async function createPackage(values) {
  const formData = buildPackageFormData(values);
  const { data } = await api.post("/api/packages", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * PUT /api/packages/:id
 * body = FormData (name, merryLimit, priceSatang, canSeeLikers, sortOrder, icon? (optional), details(JSON string array))
 */
export async function updatePackage(id, values) {
  const formData = buildPackageFormData(values);
  const { data } = await api.put(`/api/packages/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * DELETE /api/packages/:id
 */
export async function deletePackage(id) {
  const { data } = await api.delete(`/api/packages/${id}`);
  return data;
}