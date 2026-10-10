import { validatePhone, validatePassword, validateCouponCode, isAllowedDistrict } from "../../domain/validators";

describe("Domain Validators", () => {
  describe("Phone Validation (BR-01)", () => {
    test("valid Rwandan mobile phone numbers", () => {
      expect(validatePhone("0781000001")).toBe(true);
      expect(validatePhone("0721000003")).toBe(true);
      expect(validatePhone("0731000009")).toBe(true);
      expect(validatePhone("0791000002")).toBe(true);
    });

    test("invalid phone numbers", () => {
      expect(validatePhone("0711000000")).toBe(false); // prefix 071 invalid
      expect(validatePhone("078100000")).toBe(false);  // 9 digits
      expect(validatePhone("07810000012")).toBe(false); // 11 digits
      expect(validatePhone("abc1000001")).toBe(false);
      expect(validatePhone("")).toBe(false);
    });
  });

  describe("Password Validation (BR-02)", () => {
    test("valid password boundary (≥8 chars, 1 letter, 1 digit)", () => {
      expect(validatePassword("abcdefg1").valid).toBe(true);
      expect(validatePassword("Kigali2026").valid).toBe(true);
    });

    test("invalid passwords", () => {
      expect(validatePassword("abcdef1").valid).toBe(false); // 7 chars
      expect(validatePassword("abcdefgh").valid).toBe(false); // no digit
      expect(validatePassword("12345678").valid).toBe(false); // no letter
      expect(validatePassword("").valid).toBe(false);
    });
  });

  describe("Coupon Code Validation (BR-07)", () => {
    test("coupon format boundaries", () => {
      expect(validateCouponCode("ABC12").valid).toBe(false);        // 5 chars
      expect(validateCouponCode("ABC123").valid).toBe(true);         // 6 chars
      expect(validateCouponCode("MAXCODE12345").valid).toBe(true);   // 12 chars
      expect(validateCouponCode("MAXCODE123456").valid).toBe(false); // 13 chars
      expect(validateCouponCode("SAVE-10!").valid).toBe(false);     // invalid chars
    });
  });

  describe("District Validation (Checkout)", () => {
    test("allowed districts (Gasabo, Kicukiro, Nyarugenge)", () => {
      expect(isAllowedDistrict("Gasabo")).toBe(true);
      expect(isAllowedDistrict("kicukiro")).toBe(true);
      expect(isAllowedDistrict("Nyarugenge")).toBe(true);
      expect(isAllowedDistrict("Huye")).toBe(false);
      expect(isAllowedDistrict("Musanze")).toBe(false);
    });
  });
});
