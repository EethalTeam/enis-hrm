import { config } from "@/components/CustomComponents/config";

// Function to force logout
function handleLogout() {
  localStorage.removeItem("hrms_user");
  localStorage.removeItem("attendanceElapsed");
  localStorage.setItem(
    "hrms_attendance_status",
    JSON.stringify({ status: "out", break: false }),
  );
  window.location.href = "/login";
}

export async function apiRequest(endpoint, options = {}) {
  const storedUser = JSON.parse(localStorage.getItem("hrms_user") || "{}");
  const isFormData = options.body instanceof FormData;

  const finalOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      "x-user-id": storedUser?._id || "",
    },
  };

  // Only set JSON content-type for normal requests
  if (!isFormData) {
    finalOptions.headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(config.Api + "/api/" + endpoint, finalOptions);

    if (response.status === 401) {
      handleLogout();
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Failed to get data");
    }

    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
