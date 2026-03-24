import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { showToast } from "~/components/ui/toast";
import { logout } from "~/services/authService";

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

interface RequestMethod<T = any> {
  <R = T>(url: string, config?: any): Promise<R>;
}

const requestWithTypes = request as {
  get: RequestMethod;
  post: RequestMethod;
  put: RequestMethod;
  delete: RequestMethod;
};

export default requestWithTypes;

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => {
    const { data } = response;

    if (data.code !== undefined && data.code !== 200) {
      return Promise.reject(new Error(data.message || "请求失败"));
    }

    return data.data;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const { status, data } = error.response;
      console.log("data", data);
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === "/login";
      switch (status) {
        case 401:
          if (!isLoginPage) {
            logout();
            window.location.href = "/login";
          }
          break;
        default:
          showToast({
            title: "Error",
            description: data?.message ?? "Invalid credentials",
            duration: 3000,
          });
      }
    } else if (error.request) {
    } else {
    }

    return Promise.reject(error);
  },
);
