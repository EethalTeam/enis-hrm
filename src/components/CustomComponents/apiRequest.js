// utils/api.js
import { config } from '@/components/CustomComponents/config';

// Function to force logout
function handleLogout() {
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('attendanceElapsed')
    localStorage.setItem('hrms_attendance_status',{ status: 'out', break: false })
//   localStorage.clear(); // clear stored user data
  window.location.href = "/login"; // redirect to login
}

export async function apiRequest(endpoint, options = {}) {
  const userId = localStorage.getItem("userId"); // stored when user logs in
const storedUser = JSON.parse(localStorage.getItem('hrms_user'));
  const finalOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      "x-user-id": storedUser["_id"] || "", // attach userId on every request
    },
  };
  try {
    const response = await fetch(config.Api + endpoint, finalOptions);
      if (!response.ok) {
        throw new Error('Failed to get datas');
      }
    if (response.status === 401) {
      // backend says user not logged in
      handleLogout();
      return;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
