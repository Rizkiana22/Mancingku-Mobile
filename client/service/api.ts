import axios from "axios";
import { API_URL } from "@env";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const BASE_URL = API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// === SPOTS (Pake 's') ===
export const SpotService = {
  getAll: () => api.get("/spots"),
  getById: (id: number) => api.get(`/spots/${id}`),
  getBySlug: (slug: string) => api.get(`/spots/slug/${slug}`),
  getPopular: () => api.get("/spots/popular"),
};

// === SESSIONS (Pake 's') ===
export const SessionService = {
  getBySpot: (spotId: number) => api.get(`/sessions/${spotId}`),
  getNextPrice: (spotId: number) => api.get(`/sessions/${spotId}/next`),
  getOperationalHours: (spotId: number) =>
    api.get(`/sessions/${spotId}/operational-hours`),
  getNextSession: (spotId: number) => {
    return api.get(`/sessions/${spotId}/next-session`);
  },
  getDetail: (sessionId: number, date?: string) =>
    api.get(`/sessions/detail/${sessionId}`, {
      params: date ? { date } : {},
    }),
};

// === BAIT / UMPAN (Tunggal: /bait) ===
export const BaitService = {
  getAll: () => api.get("/bait"),
  create: (data: any) => api.post("/bait", data),
  update: (id: number, data: any) => api.put(`/bait/${id}`, data),
  delete: (id: number) => api.delete(`/bait/${id}`),
};

// === FISHING GEAR (CamelCase, Tunggal: /fishingGear) ===
export const fishingGearService = {
  getAll: () => api.get("/fishingGear"),
  create: (data: any) => api.post("/fishingGear", data),
  update: (id: number, data: any) => api.put(`/fishingGear/${id}`, data),
  delete: (id: number) => api.delete(`/fishingGear/${id}`),
};

export const GearService = {
  getBySpot: (spotId: string) => api.get(`/spots/${spotId}/gears`),
  getAll: () => api.get("/gears"),
  create: (data: any) => api.post("/gears", data),
  update: (id: number, data: any) => api.put(`/gears/${id}`, data),
  delete: (id: number) => api.delete(`/gears/${id}`),
};

// === BLOG (Tunggal: /blog) ===
export const BlogService = {
  getAll: () => api.get("/blog"),
  getBySlug: (slug: string) => api.get(`/blog/${slug}`),
};

export const BLOG_IMAGE_URL = (image: string) =>
  `${API_URL}/assets/blog/${image}`;

// === BOOKING (Tunggal: /booking) ===
export const BookingService = {
  create: (data: any, token: string) =>
    api.post("/booking", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getById: (id: number, token: string) =>
    api.get(`/booking/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  pay: (id: number, token: string) =>
    api.patch(`/booking/${id}/pay`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// === REVIEW (Tunggal: /review) ===
export const ReviewService = {
  create: (data: any) => api.post("/review", data),
  getBySpot: (spotId: number) => api.get(`/review/spot/${spotId}`),
};

// === AUTH ===
export const AuthService = {
  login: (data: any) => api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
};

// === USERS (Pake 's') ===
export const UserService = {
  getById: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.patch(`/users/${id}`, data),
};

// === BOOKING GEARS (Relasi Booking ↔ Gear) ===
export const BookingGearService = {
  /**
   * Ambil daftar gear yang disewa dalam satu booking
   */
  getByBookingId: (bookingId: number, token: string) =>
    api.get(`/booking-gears/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  /**
   * Tambah gear ke booking (opsional, admin / extend booking)
   */
  addToBooking: (data: any, token: string) =>
    api.post("/booking-gears", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  /**
   * Hapus semua gear dari booking (cancel / rollback)
   */
  deleteByBookingId: (bookingId: number, token: string) =>
    api.delete(`/booking-gears/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};