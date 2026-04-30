// Cloudflare Turnstile captcha doğrulama yardımcısı.
// Geliştirme ortamında secret yoksa otomatik bypass eder.
// Production'da TURNSTILE_SECRET_KEY zorunludur.

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerifyResult {
  success: boolean;
  bypassed?: boolean;
  error?: string;
  errorCodes?: string[];
}

/**
 * Cloudflare Turnstile token'ını doğrular.
 *
 * - Sunucuda TURNSTILE_SECRET_KEY tanımlı değilse, bypass eder
 *   (development davranışı). Bu sayede yerel kurulumda captcha
 *   olmadan da yorum gönderilebilir.
 * - Tanımlıysa Cloudflare'ın siteverify endpoint'i çağrılır.
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Secret yoksa bypass — development / staging davranışı.
  if (!secret) {
    return { success: true, bypassed: true };
  }

  if (!token || typeof token !== 'string') {
    return {
      success: false,
      error: 'Captcha doğrulaması eksik. Lütfen kutucuğu işaretleyin.',
      errorCodes: ['missing-input-response'],
    };
  }

  const params = new URLSearchParams();
  params.set('secret', secret);
  params.set('response', token);
  if (remoteIp) {
    params.set('remoteip', remoteIp);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[Turnstile] HTTP ${res.status}`);
      return {
        success: false,
        error: 'Captcha sunucusuna ulaşılamadı. Lütfen tekrar deneyin.',
      };
    }

    const data = (await res.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };

    if (data.success) {
      return { success: true };
    }

    const codes = data['error-codes'] || [];
    console.warn(`[Turnstile] verification failed: ${codes.join(', ')}`);
    return {
      success: false,
      error: 'Captcha doğrulaması başarısız. Lütfen tekrar deneyin.',
      errorCodes: codes,
    };
  } catch (err: any) {
    const msg = err?.name === 'AbortError' ? 'timeout' : err?.message || 'unknown';
    console.error(`[Turnstile] verify error: ${msg}`);
    return {
      success: false,
      error: 'Captcha doğrulanamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * İstek nesnesinden gerçek istemci IP'sini güvenli bir şekilde alır.
 * Trust proxy ayarı production'da Nginx arkası içindir.
 */
export function getClientIp(req: { ip?: string; headers: Record<string, any> }): string | undefined {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.ip;
}
