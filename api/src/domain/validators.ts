export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  return /^07[2389]\d{7}$/.test(phone.trim());
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: "Password is required" };
  }
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return { valid: false, message: "Password must contain at least one letter and one digit" };
  }
  return { valid: true };
}

export function validateCouponCode(code: string): { valid: boolean; message?: string } {
  if (!code) {
    return { valid: false, message: "Coupon code is required" };
  }
  const trimmed = code.trim();
  if (trimmed.length < 6 || trimmed.length > 12) {
    return { valid: false, message: "Code must be 6 to 12 characters" };
  }
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return { valid: false, message: "Code contains invalid characters" };
  }
  return { valid: true };
}

export const VALID_DISTRICTS = ["gasabo", "kicukiro", "nyarugenge"];

export function isAllowedDistrict(district?: string): boolean {
  if (!district) return false;
  return VALID_DISTRICTS.includes(district.trim().toLowerCase());
}
