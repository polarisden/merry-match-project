import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

/**
 * Switch to real backend: set in .env
 *   VITE_USE_MOCK_API=false
 *   VITE_API_BASE_URL=http://localhost:8080
 */
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

/** ตั้ง true เพื่อทดสอบว่า user ยังไม่มี membership (mock เท่านั้น) */
const MOCK_NO_MEMBERSHIP =
  import.meta.env.VITE_MOCK_NO_MEMBERSHIP === "true";

// TODO: remove mock, use real API when backend ready
const mockCurrentMembership = {
  id: 1,
  planId: 1,
  planName: "plan1",
  price: 1000,
  merryLimit: 70,
  planDetail: ["merryDetail1.1", "merryDetail1.2"],
  icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_coraz%C3%B3n.svg/960px-Heart_coraz%C3%B3n.svg.png",
  startDate: "01/04/2022",
  nextBillingDate: "01/05/2022",
  status: "active",
};

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * คืน null เมื่อยังไม่มี subscription / ไม่มีแพ็กปัจจุบัน
 * (backend อาจส่ง null, {}, หรือ planId เป็น null)
 */
export function normalizeMembership(data) {
  if (data == null) return null;
  const id = data.planId;
  if (id == null || id === "") return null;
  return data;
}

export async function getCurrentMembershipMock() {
  await delay(500);
  if (MOCK_NO_MEMBERSHIP) return null;
  return mockCurrentMembership;
}

export async function getCurrentMembershipFromApi() {
  try {
    const { data } = await api.get("/api/membership/current");
    return normalizeMembership(data);
  } catch (e) {
    // ยังไม่เคยสมัคร / ไม่มีข้อมูล membership
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

export async function getCurrentMembership() {
  const raw = USE_MOCK_API
    ? await getCurrentMembershipMock()
    : await getCurrentMembershipFromApi();
  return normalizeMembership(raw);
}

export { USE_MOCK_API };
