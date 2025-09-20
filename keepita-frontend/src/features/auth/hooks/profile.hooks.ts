import { useAuthStore } from "../store";
import { useAuthApi, type UpdateUserProfileRespone } from "../api/auth.api";
import { useMutation } from "@tanstack/react-query";

interface ProfileData {
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string | File | null;
  [key: string]: any;
}

export const useProfile = () => {
  const { updateUserProfile } = useAuthApi();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation<UpdateUserProfileRespone, Error, ProfileData>({
    mutationFn: async (profileData: ProfileData) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await updateUserProfile(profileData);

      return response;
    },
    onSuccess: (data) => {
      if (updateUser && data.user) {
        updateUser(data.user);
      }
    },
  });
};
