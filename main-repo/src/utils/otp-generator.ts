export const generateOTP = (length: number): string => {
  const min = Math.pow(10, length - 1); // Minimum value based on length
  const max = Math.pow(10, length) - 1; // Maximum value based on length
  const otp = Math.floor(min + Math.random() * (max - min + 1)).toString(); // Generate random number within the range

  return otp;
};
