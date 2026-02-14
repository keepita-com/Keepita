import type {
  Contact,
  GroupedContacts,
  GetContactsParams,
} from "../types/contact.types";
import { buildQueryParams } from "../../../../../shared/utils";


export const getInitials = (name: string): string => {
  
  if (!name || typeof name !== "string") {
    return "?";
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return "?";
  }

  return trimmedName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};


export const formatPhoneNumber = (phone: string): string => {
  
  if (!phone || typeof phone !== "string") {
    return "No phone";
  }

  const cleaned = phone.replace(/\D/g, "");

  
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  
  if (phone.length === 11 && phone.indexOf("98") === 0) {
    return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(
      5,
      8
    )} ${phone.slice(8)}`;
  }

  return phone;
};


export const getDisplayName = (contact: Contact): string => {
  
  const name = contact?.name;
  if (name && typeof name === "string" && name.trim()) {
    return name.trim();
  }
  return contact?.phone_number || "Unknown Contact";
};


export const formatDateOfBirth = (dateString: string | null): string => {
  if (!dateString) return "No birthday";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return "Invalid date";
  }
};


export const getAvatarColor = (contact: Contact): string => {
  const name = getDisplayName(contact);
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];

  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};


export const isValidContact = (contact: Partial<Contact>): boolean => {
  return !!(contact.name?.trim() || contact.phone_number?.trim());
};


export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") return false;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};


export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const isCompleteContact = (contact: Contact): boolean => {
  return !!(
    contact.name?.trim() &&
    contact.phone_number?.trim() &&
    isValidPhoneNumber(contact.phone_number)
  );
};


export const groupByLetter = (contacts: Contact[]): GroupedContacts => {
  const groups: GroupedContacts = {};

  contacts.forEach((contact) => {
    const name = getDisplayName(contact);
    const letter = name.charAt(0).toUpperCase();

    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(contact);
  });

  return groups;
};


export const groupByFavorite = (
  contacts: Contact[]
): { favorites: Contact[]; others: Contact[] } => {
  const favorites: Contact[] = [];
  const others: Contact[] = [];

  contacts.forEach((contact) => {
    if (contact.is_favorite) {
      favorites.push(contact);
    } else {
      others.push(contact);
    }
  });

  return { favorites, others };
};


export const groupByImage = (
  contacts: Contact[]
): { withImages: Contact[]; withoutImages: Contact[] } => {
  const withImages: Contact[] = [];
  const withoutImages: Contact[] = [];

  contacts.forEach((contact) => {
    if (contact.profile_image) {
      withImages.push(contact);
    } else {
      withoutImages.push(contact);
    }
  });

  return { withImages, withoutImages };
};


export const isFavorite = (contact: Contact): boolean => {
  return contact.is_favorite;
};


export const hasProfileImage = (contact: Contact): boolean => {
  return !!contact.profile_image;
};


export const hasBirthday = (contact: Contact): boolean => {
  return !!contact.date_of_birth;
};


export const getAge = (contact: Contact): number | null => {
  if (!contact.date_of_birth) return null;

  try {
    const birthDate = new Date(contact.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch {
    return null;
  }
};


export const isBirthdayToday = (contact: Contact): boolean => {
  if (!contact.date_of_birth) return false;

  try {
    const birthDate = new Date(contact.date_of_birth);
    const today = new Date();

    return (
      birthDate.getMonth() === today.getMonth() &&
      birthDate.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
};


export const getContactInfo = (contact: Contact) => ({
  name: getDisplayName(contact),
  initials: getInitials(contact.name),
  phone: formatPhoneNumber(contact.phone_number),
  birthday: formatDateOfBirth(contact.date_of_birth),
  avatarColor: getAvatarColor(contact),
  isFavorite: isFavorite(contact),
  hasImage: hasProfileImage(contact),
  hasBirthday: hasBirthday(contact),
  age: getAge(contact),
  isBirthdayToday: isBirthdayToday(contact),
  isComplete: isCompleteContact(contact),
  isValid: isValidContact(contact),
});


export const getContactStats = (contacts: Contact[]) => ({
  total: contacts.length,
  favorites: contacts.filter(isFavorite).length,
  withImages: contacts.filter(hasProfileImage).length,
  withBirthdays: contacts.filter(hasBirthday).length,
  birthdaysToday: contacts.filter(isBirthdayToday).length,
  complete: contacts.filter(isCompleteContact).length,
  byLetter: groupByLetter(contacts),
});


export const buildContactsQueryParams = (
  params: Partial<GetContactsParams>
) => {
  return buildQueryParams(params);
};
