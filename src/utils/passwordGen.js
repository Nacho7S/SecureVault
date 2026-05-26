const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export const generatePassword = ({
  length = 16,
  useUppercase = true,
  useNumbers = true,
  useSymbols = true,
} = {}) => {
  let charset = LOWERCASE;
  const required = []; // karakter wajib ada minimal 1

  if (useUppercase) {
    charset += UPPERCASE;
    required.push(randomChar(UPPERCASE));
  }
  if (useNumbers) {
    charset += NUMBERS;
    required.push(randomChar(NUMBERS));
  }
  if (useSymbols) {
    charset += SYMBOLS;
    required.push(randomChar(SYMBOLS));
  }

  // Isi sisa panjang password dengan karakter acak dari charset
  const remaining = Array.from(
    { length: length - required.length },
    () => randomChar(charset)
  );

  // Shuffle agar karakter wajib tidak selalu di posisi yang sama
  const combined = [...required, ...remaining];
  return shuffleArray(combined).join("");
};

// ============================================================
// CEK KEKUATAN PASSWORD - untuk feedback ke user
// ============================================================
export const checkPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Lemah", color: "#ef4444" };
  if (score <= 3) return { label: "Sedang", color: "#f59e0b" };
  return { label: "Kuat", color: "#22c55e" };
};

// ---- Helper functions ----
const randomChar = (str) =>
  str[Math.floor(Math.random() * str.length)];

const shuffleArray = (arr) =>
  arr.sort(() => Math.random() - 0.5);