import { useNavigate } from "react-router-dom";
import { type LoginRequest, type LoginResponse } from "../api/auth.api";
import { loginRequest } from "../services/loginRequest";
import { useAuthStore } from "../store";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const navigate = useNavigate();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async ({ username, password }: LoginRequest) => {
      const response = await loginRequest({ username, password });
      return response;
    },
    onSuccess: (data) => {
      setAuthData({
        user: data.user,
        access: data.access,
        refresh: data.refresh,
        isAuthenticated: true,
      });

      navigate("/");
    },
  });
};
