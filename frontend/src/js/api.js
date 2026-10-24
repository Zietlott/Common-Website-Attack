/* =========================================================
   API HELPER
   Dùng chung cho các Lab trong Web Security Lab
   ========================================================= */

// Backend Node.js đang chạy tại cổng 3000.
const API_BASE_URL = "http://localhost:3000/api";

/**
 * Gửi HTTP request đến Backend.
 *
 * @param {string} endpoint - Đường dẫn API, ví dụ: "/labs/sqli/secure"
 * @param {object} options - Cấu hình fetch
 * @returns {Promise<object>} Dữ liệu JSON từ Backend
 */
async function apiRequest(endpoint, options = {}) {
  let response;
  const headers = { ...options.headers };

  // GET requests should stay CORS-simple; only JSON requests need this header.
  if (options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,

      // Cần thiết để trình duyệt gửi/nhận cookie session của CSRF Lab.
      credentials: "include",
      headers,
    });
  } catch (error) {
    // Lỗi kết nối: Backend chưa chạy hoặc địa chỉ không đúng.
    throw new Error(
      "Không thể kết nối Backend. Hãy kiểm tra server và địa chỉ API.",
    );
  }

  // Đọc phản hồi JSON, kể cả khi Backend trả về lỗi HTTP.
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Backend trả về dữ liệu không hợp lệ.");
  }

  // Các mã 400, 401, 403, 500... đều được xử lý tại đây.
  if (!response.ok) {
    throw new Error(
      result.message || `Yêu cầu thất bại (HTTP ${response.status}).`,
    );
  }

  return result;
}

/**
 * Gửi dữ liệu JSON bằng phương thức POST.
 */
async function apiPost(endpoint, data, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
}
