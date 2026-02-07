import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FiHome, FiCpu, FiMapPin, FiSmile } from 'react-icons/fi';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const CATEGORIES = [
  { id: 'Essentials', label: 'The Essentials', icon: FiHome },
  { id: 'Gear', label: 'The Gear', icon: FiCpu },
  { id: 'Logistics', label: 'The Logistics', icon: FiMapPin },
  { id: 'Fun', label: 'The Fun', icon: FiSmile },
];