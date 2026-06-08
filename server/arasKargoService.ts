import { storage } from './storage';

const SETORDER_URL_DEFAULT = 'https://customerws.araskargo.com.tr/arascargoservice.asmx';
const QUERY_URL_DEFAULT = 'https://customerservices.araskargo.com.tr/ArasCargoCustomerIntegrationService/ArasCargoIntegrationService.svc';

export interface ArasCredentials {
  username: string;
  password: string;
  customerCode: string;
  setorderUrl: string;
  queryUrl: string;
  senderAddressId: string;
  defaultDesi: string;
  enabled: boolean;
}

export async function getArasCredentials(): Promise<ArasCredentials> {
  const settings = await storage.getSiteSettings();
  return {
    username: settings.aras_kargo_username || '',
    password: settings.aras_kargo_password || '',
    customerCode: settings.aras_kargo_customer_code || '',
    setorderUrl: settings.aras_kargo_setorder_url || SETORDER_URL_DEFAULT,
    queryUrl: settings.aras_kargo_query_url || QUERY_URL_DEFAULT,
    senderAddressId: settings.aras_kargo_sender_address_id || '',
    defaultDesi: settings.aras_kargo_default_desi || '1',
    enabled: settings.aras_kargo_enabled === 'true',
  };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length >= 12) return digits.slice(2);
  if (digits.startsWith('0') && digits.length >= 11) return digits.slice(1);
  return digits;
}

function toUpperTurkish(str: string): string {
  return str
    .replace(/ı/g, 'I').replace(/i/g, 'İ')
    .replace(/ş/g, 'Ş').replace(/ğ/g, 'Ğ')
    .replace(/ü/g, 'Ü').replace(/ö/g, 'Ö')
    .replace(/ç/g, 'Ç')
    .toUpperCase();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface SetOrderResult {
  success: boolean;
  resultCode?: number;
  resultMessage?: string;
  integrationCode?: string;
  error?: string;
}

export async function createShipment(params: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  district: string;
  isWorldwide?: boolean;
}): Promise<SetOrderResult> {
  const creds = await getArasCredentials();

  if (!creds.username || !creds.password) {
    return { success: false, error: 'Aras Kargo API bilgileri eksik. Ayarlar > Aras Kargo bölümünden giriniz.' };
  }

  const phone = normalizePhone(params.customerPhone);
  const cityName = toUpperTurkish(params.city);
  const districtName = toUpperTurkish(params.district);
  const tradingWaybillNumber = params.orderNumber.slice(0, 16);
  const integrationCode = params.orderNumber.slice(0, 32);
  const barcodeNumber = params.orderNumber.replace(/[^A-Za-z0-9]/g, '').slice(0, 32) || integrationCode.slice(0, 32);
  const desi = creds.defaultDesi;
  const fullAddress = params.address.slice(0, 250);

  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <SetOrder xmlns="http://tempuri.org/">
      <orderInfo>
        <Order>
          <UserName>${escapeXml(creds.username)}</UserName>
          <Password>${escapeXml(creds.password)}</Password>
          <TradingWaybillNumber>${escapeXml(tradingWaybillNumber)}</TradingWaybillNumber>
          <InvoiceNumber>${escapeXml(params.orderNumber.slice(0, 20))}</InvoiceNumber>
          <IntegrationCode>${escapeXml(integrationCode)}</IntegrationCode>
          <ReceiverName>${escapeXml(params.customerName)}</ReceiverName>
          <ReceiverAddress>${escapeXml(fullAddress)}</ReceiverAddress>
          <ReceiverPhone1>${escapeXml(phone)}</ReceiverPhone1>
          <ReceiverCityName>${escapeXml(cityName)}</ReceiverCityName>
          <ReceiverTownName>${escapeXml(districtName)}</ReceiverTownName>
          <VolumetricWeight>${escapeXml(desi)}</VolumetricWeight>
          <PieceCount>1</PieceCount>
          <PayorTypeCode>1</PayorTypeCode>
          <IsWorldWide>${params.isWorldwide ? '1' : '0'}</IsWorldWide>
          <PieceDetails>
            <PieceDetail>
              <VolumetricWeight>${escapeXml(desi)}</VolumetricWeight>
              <Weight>${escapeXml(desi)}</Weight>
              <BarcodeNumber>${escapeXml(barcodeNumber)}</BarcodeNumber>
              <ProductNumber></ProductNumber>
              <Description>Polen Stone Siparis</Description>
            </PieceDetail>
          </PieceDetails>
          <SenderAccountAddressId>${escapeXml(creds.senderAddressId)}</SenderAccountAddressId>
        </Order>
      </orderInfo>
      <userName>${escapeXml(creds.username)}</userName>
      <password>${escapeXml(creds.password)}</password>
    </SetOrder>
  </soap12:Body>
</soap12:Envelope>`;

  try {
    const response = await fetch(creds.setorderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8; action="http://tempuri.org/SetOrder"',
        'Accept': 'application/soap+xml, text/xml',
      },
      body: soapBody,
      signal: AbortSignal.timeout(30000),
    });

    const text = await response.text();
    console.log('[ArasKargo] SetOrder response:', text.slice(0, 500));

    const resultCodeMatch = text.match(/<(?:\w+:)?ResultCode[^>]*>(\d+)<\/(?:\w+:)?ResultCode>/i);
    const resultMessageMatch = text.match(/<(?:\w+:)?ResultMessage[^>]*>([^<]*)<\/(?:\w+:)?ResultMessage>/i);

    const resultCode = resultCodeMatch ? parseInt(resultCodeMatch[1]) : -999;
    const resultMessage = resultMessageMatch ? resultMessageMatch[1] : 'Yanıt ayrıştırılamadı';

    if (resultCode === 0) {
      return { success: true, resultCode, resultMessage: 'Kayıt başarıyla oluşturuldu', integrationCode };
    }

    return { success: false, resultCode, resultMessage: resultMessage || `Hata kodu: ${resultCode}` };
  } catch (error: any) {
    console.error('[ArasKargo] SetOrder error:', error);
    return { success: false, error: `Bağlantı hatası: ${error.message}` };
  }
}

export interface QueryShipmentResult {
  success: boolean;
  found?: boolean;
  trackingNumber?: string;
  cargoStatus?: string;
  statusCode?: number;
  deliveryDate?: string;
  deliveredTo?: string;
  waybillNumber?: string;
  error?: string;
}

export async function queryShipmentByIntegrationCode(integrationCode: string): Promise<QueryShipmentResult> {
  const creds = await getArasCredentials();

  if (!creds.username || !creds.password) {
    return { success: false, error: 'Aras Kargo API bilgileri eksik.' };
  }

  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <GetOrderWithIntegrationCode xmlns="http://tempuri.org/">
      <userName>${escapeXml(creds.username)}</userName>
      <password>${escapeXml(creds.password)}</password>
      <integrationCode>${escapeXml(integrationCode.slice(0, 32))}</integrationCode>
    </GetOrderWithIntegrationCode>
  </soap12:Body>
</soap12:Envelope>`;

  try {
    const response = await fetch(creds.setorderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8; action="http://tempuri.org/GetOrderWithIntegrationCode"',
        'Accept': 'application/soap+xml, text/xml',
      },
      body: soapBody,
      signal: AbortSignal.timeout(30000),
    });

    const text = await response.text();
    console.log('[ArasKargo] QueryShipment response:', text.slice(0, 800));

    const resultCodeMatch = text.match(/<(?:\w+:)?ResultCode[^>]*>(\d+)<\/(?:\w+:)?ResultCode>/i);
    const resultCode = resultCodeMatch ? parseInt(resultCodeMatch[1]) : -999;

    if (resultCode !== 0 && resultCode !== -999) {
      const resultMessageMatch = text.match(/<(?:\w+:)?ResultMessage[^>]*>([^<]*)<\/(?:\w+:)?ResultMessage>/i);
      return {
        success: false,
        found: false,
        error: resultMessageMatch ? resultMessageMatch[1] : `Hata kodu: ${resultCode}`,
      };
    }

    const trackingMatch = text.match(/<(?:\w+:)?CargoTrackingNumber[^>]*>([^<]+)<\/(?:\w+:)?CargoTrackingNumber>/i)
      || text.match(/<(?:\w+:)?TrackingNumber[^>]*>([^<]+)<\/(?:\w+:)?TrackingNumber>/i)
      || text.match(/<(?:\w+:)?KargoTakipNo[^>]*>([^<]+)<\/(?:\w+:)?KargoTakipNo>/i);
    const waybillMatch = text.match(/<(?:\w+:)?WaybillNumber[^>]*>([^<]+)<\/(?:\w+:)?WaybillNumber>/i)
      || text.match(/<(?:\w+:)?IrsaliyeNo[^>]*>([^<]+)<\/(?:\w+:)?IrsaliyeNo>/i);
    const statusMatch = text.match(/<(?:\w+:)?Status[^>]*>([^<]+)<\/(?:\w+:)?Status>/i)
      || text.match(/<(?:\w+:)?Durum[^>]*>([^<]+)<\/(?:\w+:)?Durum>/i);
    const deliveryDateMatch = text.match(/<(?:\w+:)?DeliveryDate[^>]*>([^<]+)<\/(?:\w+:)?DeliveryDate>/i)
      || text.match(/<(?:\w+:)?TeslimTarihi[^>]*>([^<]+)<\/(?:\w+:)?TeslimTarihi>/i);
    const deliveredToMatch = text.match(/<(?:\w+:)?ReceiverName[^>]*>([^<]+)<\/(?:\w+:)?ReceiverName>/i)
      || text.match(/<(?:\w+:)?TeslimAlan[^>]*>([^<]+)<\/(?:\w+:)?TeslimAlan>/i);

    const trackingNumber = trackingMatch?.[1]?.trim();
    const waybillNumber = waybillMatch?.[1]?.trim();

    if (!trackingNumber && !waybillNumber) {
      return {
        success: true,
        found: false,
        error: 'Şube henüz irsaliye oluşturmadı. Kargo fiziksel olarak şubeye teslim edilince takip numarası oluşacak.',
      };
    }

    return {
      success: true,
      found: true,
      trackingNumber: trackingNumber || waybillNumber,
      waybillNumber,
      cargoStatus: statusMatch?.[1]?.trim(),
      deliveryDate: deliveryDateMatch?.[1]?.trim(),
      deliveredTo: deliveredToMatch?.[1]?.trim(),
    };
  } catch (error: any) {
    console.error('[ArasKargo] QueryShipment error:', error);
    return { success: false, error: `Bağlantı hatası: ${error.message}` };
  }
}
