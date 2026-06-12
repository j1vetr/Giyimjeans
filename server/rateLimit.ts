import rateLimit from 'express-rate-limit';

const isTest = () => process.env.NODE_ENV === 'test';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin.' },
  skip: isTest,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla kayıt isteği. Lütfen 1 saat sonra tekrar deneyin.' },
  skip: isTest,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla şifre sıfırlama isteği. Lütfen 1 saat sonra tekrar deneyin.' },
  skip: isTest,
});

export const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla sorgulama. Lütfen birkaç dakika sonra tekrar deneyin.' },
  skip: isTest,
});

export const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla kupon doğrulama isteği. Lütfen birkaç dakika sonra tekrar deneyin.' },
  skip: isTest,
});
