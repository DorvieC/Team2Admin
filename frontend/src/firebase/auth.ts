import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  confirmPasswordReset,
  verifyPasswordResetCode,
  signInWithPhoneNumber,
  linkWithPhoneNumber,
  updatePassword,
  RecaptchaVerifier,
  signOut,
  updateProfile,
  type ConfirmationResult,
  type UserCredential,
} from 'firebase/auth';
import { firebaseAuth } from './config';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Цей email вже зареєстрований.',
  'auth/invalid-email': 'Некоректний формат email.',
  'auth/weak-password': 'Пароль занадто слабкий (мінімум 6 символів).',
  'auth/user-not-found': 'Користувача з таким email не знайдено.',
  'auth/wrong-password': 'Невірний пароль.',
  'auth/invalid-credential': 'Невірний email або пароль.',
  'auth/too-many-requests': 'Занадто багато спроб. Спробуйте пізніше.',
  'auth/network-request-failed': 'Проблема з мережею. Перевірте з\'єднання.',
  'auth/invalid-phone-number': 'Некоректний формат номера телефону.',
  'auth/invalid-verification-code': 'Невірний код підтвердження.',
  'auth/code-expired': 'Код підтвердження застарів. Надішліть новий.',
  'auth/provider-already-linked': 'Цей номер телефону вже прив\'язаний.',
  'auth/credential-already-in-use': 'Цей номер телефону вже використовується іншим акаунтом.',
  'auth/account-exists-with-different-credential': 'Цей номер телефону вже прив\'язаний до іншого акаунту.',
};

export function mapFirebaseError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  const message = (error as { message?: string })?.message;
  if (code) return `Сталася помилка (${code}). Спробуйте ще раз.`;
  if (message) return `Сталася помилка: ${message}`;
  return 'Сталася помилка. Спробуйте ще раз.';
}

export async function firebaseRegister(
  email: string,
  password: string,
  name: string,
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }
  sendEmailVerification(credential.user).catch(() => undefined);
  return credential;
}

export function isEmailFormat(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhoneFormat(value: string): boolean {
  return /^\+?\d{9,15}$/.test(value.trim().replace(/[\s()-]/g, ''));
}

export function normalizePhone(value: string): string {
  const digits = value.trim().replace(/[\s()-]/g, '');
  return digits.startsWith('+') ? digits : `+${digits}`;
}

let recaptchaVerifier: RecaptchaVerifier | null = null;

function getRecaptchaVerifier(): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
      size: 'invisible',
    });
  }
  return recaptchaVerifier;
}

function resetRecaptcha(): void {
  recaptchaVerifier?.clear();
  recaptchaVerifier = null;
}

export async function firebaseSendPhoneOtp(phoneNumber: string): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier();
  try {
    return await signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
  } finally {
    resetRecaptcha();
  }
}

export async function firebaseLinkPhoneOtp(phoneNumber: string): Promise<ConfirmationResult> {
  if (!firebaseAuth.currentUser) throw new Error('Not authenticated');
  const verifier = getRecaptchaVerifier();
  try {
    return await linkWithPhoneNumber(firebaseAuth.currentUser, phoneNumber, verifier);
  } finally {
    resetRecaptcha();
  }
}

export async function firebaseUpdatePassword(newPassword: string): Promise<void> {
  if (!firebaseAuth.currentUser) throw new Error('Not authenticated');
  return updatePassword(firebaseAuth.currentUser, newPassword);
}

export async function firebaseLogin(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function firebaseGoogleLogin(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(firebaseAuth, provider);
}

export async function firebaseLogout(): Promise<void> {
  return signOut(firebaseAuth);
}

export async function firebaseSendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(firebaseAuth, email, {
    url: `${window.location.origin}/new-password`,
    handleCodeInApp: true,
  });
}

export async function firebaseVerifyResetCode(oobCode: string): Promise<string> {
  return verifyPasswordResetCode(firebaseAuth, oobCode);
}

export async function firebaseConfirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
  return confirmPasswordReset(firebaseAuth, oobCode, newPassword);
}

export async function getFirebaseIdToken(credential: UserCredential): Promise<string> {
  return credential.user.getIdToken();
}
