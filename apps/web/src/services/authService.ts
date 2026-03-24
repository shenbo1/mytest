import request from "~/utils/request";

export interface LoginDto {
  email: string;
  password: string;
}

export const login = async (variables: LoginDto) => {
  const result = await request.post("/auth/login", variables);
  if (result.success) {
    const { token, sub, ...user } = result.data;
    localStorage.setItem("user_info", JSON.stringify(user));
    localStorage.setItem("token", token);

    window.dispatchEvent(new CustomEvent("user-login", { detail: user }));

    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_info");
  window.dispatchEvent(new Event("user-logout"));
  window.location.href = "/login";
};

export const getCurrentUser = () => {
  const userInfo = localStorage.getItem("user_info");
  if (userInfo) {
    return JSON.parse(userInfo);
  }
  return null;
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};
