import { useNavigate } from "react-router-dom";
import { useAuthApi, type RegisterRequest } from "../api/auth.api";
import { useMutation } from "@tanstack/react-query";

export const useRegister = () => {
  const { registerRequest } = useAuthApi();
  const navigate = useNavigate();

  return useMutation<void, Error, RegisterRequest>({
    mutationFn: async ({
      username,
      email,
      password1,
      password2,
    }: RegisterRequest) => {
      await registerRequest({ username, email, password1, password2 });
    },
    onSuccess: () => {
      setTimeout(() => navigate("/login"), 3000);
    },
  });
};
