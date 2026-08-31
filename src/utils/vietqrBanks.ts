/**
 * VietQR Standard Bank Information & BIN Codes
 * Compliant with NAPAS 24/7 VietQR Specifications
 */

export interface BankInfo {
  bin: string;
  shortName: string;
  name: string;
  aliases: string[];
  logo?: string;
}

export const VIETQR_BANKS: BankInfo[] = [
  {
    bin: '970436',
    shortName: 'Vietcombank',
    name: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank - VCB)',
    aliases: ['vietcombank', 'vcb', 'ngoai thuong', 'ngoại thương', 'vietcom', '970436']
  },
  {
    bin: '970422',
    shortName: 'MBBank',
    name: 'Ngân hàng TMCP Quân Đội (MB Bank)',
    aliases: ['mb', 'mbbank', 'mb bank', 'quan doi', 'quân đội', '970422']
  },
  {
    bin: '970407',
    shortName: 'Techcombank',
    name: 'Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank - TCB)',
    aliases: ['techcombank', 'tcb', 'techcom', 'ky thuong', 'kỹ thương', '970407']
  },
  {
    bin: '970415',
    shortName: 'VietinBank',
    name: 'Ngân hàng TMCP Công Thương Việt Nam (VietinBank - CTG)',
    aliases: ['vietinbank', 'ctg', 'vietin', 'cong thuong', 'công thương', 'viettinbank', 'viettin', '970415']
  },
  {
    bin: '970418',
    shortName: 'BIDV',
    name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
    aliases: ['bidv', 'dau tu va phat trien', 'đầu tư và phát triển', 'đầu tư', '970418']
  },
  {
    bin: '970416',
    shortName: 'ACB',
    name: 'Ngân hàng TMCP Á Châu (ACB)',
    aliases: ['acb', 'a chau', 'á châu', '970416']
  },
  {
    bin: '970432',
    shortName: 'VPBank',
    name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)',
    aliases: ['vpbank', 'vpb', 'thinh vuong', 'thịnh vượng', '970432']
  },
  {
    bin: '970423',
    shortName: 'TPBank',
    name: 'Ngân hàng TMCP Tiên Phong (TPBank)',
    aliases: ['tpbank', 'tpb', 'tien phong', 'tiên phong', '970423']
  },
  {
    bin: '970403',
    shortName: 'Sacombank',
    name: 'Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank - STB)',
    aliases: ['sacombank', 'stb', 'sai gon thuong tin', 'sài gòn thương tín', 'sacom', '970403']
  },
  {
    bin: '970405',
    shortName: 'Agribank',
    name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank - VBA)',
    aliases: ['agribank', 'vba', 'nong nghiep', 'nông nghiệp', 'agri', '970405']
  },
  {
    bin: '970441',
    shortName: 'VIB',
    name: 'Ngân hàng TMCP Quốc tế Việt Nam (VIB)',
    aliases: ['vib', 'quoc te', 'quốc tế', '970441']
  },
  {
    bin: '970437',
    shortName: 'HDBank',
    name: 'Ngân hàng TMCP Phát triển TP.HCM (HDBank)',
    aliases: ['hdbank', 'hdb', 'phat trien tphcm', 'phát triển tphcm', '970437']
  },
  {
    bin: '970443',
    shortName: 'SHB',
    name: 'Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)',
    aliases: ['shb', 'sai gon ha noi', 'sài gòn hà nội', '970443']
  },
  {
    bin: '970426',
    shortName: 'MSB',
    name: 'Ngân hàng TMCP Hàng Hải Việt Nam (MSB - Maritime Bank)',
    aliases: ['msb', 'hang hai', 'hàng hải', 'maritime', '970426']
  },
  {
    bin: '970448',
    shortName: 'OCB',
    name: 'Ngân hàng TMCP Phương Đông (OCB)',
    aliases: ['ocb', 'phuong dong', 'phương đông', '970448']
  },
  {
    bin: '970449',
    shortName: 'LPBank',
    name: 'Ngân hàng TMCP Lộc Phát Việt Nam (LPBank / LienVietPostBank)',
    aliases: ['lpbank', 'lienvietpostbank', 'lien viet', 'liên việt', 'loc phat', 'lộc phát', '970449']
  },
  {
    bin: '970440',
    shortName: 'SeABank',
    name: 'Ngân hàng TMCP Đông Nam Á (SeABank)',
    aliases: ['seabank', 'dong nam a', 'đông nam á', '970440']
  },
  {
    bin: '970431',
    shortName: 'Eximbank',
    name: 'Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam (Eximbank - EIB)',
    aliases: ['eximbank', 'eib', 'xuat nhap khau', 'xuất nhập khẩu', '970431']
  },
  {
    bin: '970429',
    shortName: 'SCB',
    name: 'Ngân hàng TMCP Sài Gòn (SCB)',
    aliases: ['scb', 'sai gon', 'sài gòn', '970429']
  },
  {
    bin: '970454',
    shortName: 'BVBank',
    name: 'Ngân hàng TMCP Bản Việt (BVBank - VietCapital)',
    aliases: ['bvbank', 'ban viet', 'bản việt', 'vietcapital', '970454']
  },
  {
    bin: '970409',
    shortName: 'BacABank',
    name: 'Ngân hàng TMCP Bắc Á (Bac A Bank)',
    aliases: ['bacabank', 'bac a', 'bắc á', '970409']
  },
  {
    bin: '970438',
    shortName: 'BaoVietBank',
    name: 'Ngân hàng TMCP Bảo Việt (BaoViet Bank)',
    aliases: ['baovietbank', 'bao viet', 'bảo việt', '970438']
  },
  {
    bin: '970412',
    shortName: 'PVcomBank',
    name: 'Ngân hàng TMCP Đại Chúng Việt Nam (PVcomBank)',
    aliases: ['pvcombank', 'pvcom', 'dai chung', 'đại chúng', '970412']
  },
  {
    bin: '970442',
    shortName: 'ShinhanBank',
    name: 'Ngân hàng TNHH MTV Shinhan Việt Nam (Shinhan Bank)',
    aliases: ['shinhan', 'shinhanbank', '970442']
  },
  {
    bin: '963388',
    shortName: 'Timo',
    name: 'Ngân hàng số Timo (Bản Việt / Timo)',
    aliases: ['timo', '963388']
  },
  {
    bin: '546034',
    shortName: 'Cake',
    name: 'Ngân hàng số Cake by VPBank',
    aliases: ['cake', 'cake by vpbank', '546034']
  },
  {
    bin: '971005',
    shortName: 'ViettelMoney',
    name: 'Tổng công ty Dịch vụ số Viettel (Viettel Money)',
    aliases: ['viettelmoney', 'viettel money', 'viettel pay', 'viettelpay', 'viettel', '971005']
  },
  {
    bin: '971011',
    shortName: 'VNPTMoney',
    name: 'Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT Money)',
    aliases: ['vnptmoney', 'vnpt money', 'vnpt pay', 'vnpt', '971011']
  },
  {
    bin: '970422',
    shortName: 'MoMo',
    name: 'Ví Điện Tử MoMo (Số điện thoại)',
    aliases: ['momo', 'ví momo', 'vi momo']
  }
];

/**
 * Normalizes Vietnamese string for robust fuzzy matching
 */
function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves accurate VietQR Bank Information (BIN code, Short Name, Full Name)
 * Never defaults blindly to MB Bank when a different bank is requested!
 */
export function getBankInfo(bankName?: string, bankCode?: string): BankInfo {
  // 1. Match by exact BIN / BankCode first if valid 6 digits
  if (bankCode && bankCode.trim()) {
    const cleanCode = bankCode.trim();
    const matchedByBin = VIETQR_BANKS.find(b => b.bin === cleanCode);
    if (matchedByBin) return matchedByBin;
  }

  const raw = (bankName || '').trim();
  if (!raw) {
    // Default to Vietcombank as premier bank or MB if unspecified
    return VIETQR_BANKS[0]; // Vietcombank 970436
  }

  const norm = normalizeText(raw);

  // 2. Exact or Alias matching
  for (const bank of VIETQR_BANKS) {
    const shortNorm = normalizeText(bank.shortName);
    if (norm === shortNorm || norm.includes(shortNorm)) {
      return bank;
    }
    for (const alias of bank.aliases) {
      const aliasNorm = normalizeText(alias);
      if (norm === aliasNorm || norm.includes(aliasNorm)) {
        return bank;
      }
    }
  }

  // 3. Priority substring checks for popular Vietnamese Banks
  if (norm.includes('vietcom') || norm.includes('vcb') || norm.includes('ngoai thuong')) {
    return VIETQR_BANKS.find(b => b.bin === '970436') || VIETQR_BANKS[0];
  }
  if (norm.includes('vietin') || norm.includes('ctg') || norm.includes('viettin') || norm.includes('cong thuong')) {
    return VIETQR_BANKS.find(b => b.bin === '970415') || VIETQR_BANKS[3];
  }
  if (norm.includes('techcom') || norm.includes('tcb') || norm.includes('ky thuong')) {
    return VIETQR_BANKS.find(b => b.bin === '970407') || VIETQR_BANKS[2];
  }
  if (norm.includes('bidv') || norm.includes('dau tu')) {
    return VIETQR_BANKS.find(b => b.bin === '970418') || VIETQR_BANKS[4];
  }
  if (norm.includes('acb') || norm.includes('a chau')) {
    return VIETQR_BANKS.find(b => b.bin === '970416') || VIETQR_BANKS[5];
  }
  if (norm.includes('vp') || norm.includes('thinh vuong')) {
    return VIETQR_BANKS.find(b => b.bin === '970432') || VIETQR_BANKS[6];
  }
  if (norm.includes('tp') || norm.includes('tien phong')) {
    return VIETQR_BANKS.find(b => b.bin === '970423') || VIETQR_BANKS[7];
  }
  if (norm.includes('sacom') || norm.includes('stb') || norm.includes('sai gon thuong tin')) {
    return VIETQR_BANKS.find(b => b.bin === '970403') || VIETQR_BANKS[8];
  }
  if (norm.includes('agri') || norm.includes('vba') || norm.includes('nong nghiep')) {
    return VIETQR_BANKS.find(b => b.bin === '970405') || VIETQR_BANKS[9];
  }
  if (norm.includes('mb') || norm.includes('quan doi')) {
    return VIETQR_BANKS.find(b => b.bin === '970422') || VIETQR_BANKS[1];
  }
  if (norm.includes('vib') || norm.includes('quoc te')) {
    return VIETQR_BANKS.find(b => b.bin === '970441') || VIETQR_BANKS[10];
  }
  if (norm.includes('hd') || norm.includes('hdbank')) {
    return VIETQR_BANKS.find(b => b.bin === '970437') || VIETQR_BANKS[11];
  }
  if (norm.includes('shb')) {
    return VIETQR_BANKS.find(b => b.bin === '970443') || VIETQR_BANKS[12];
  }
  if (norm.includes('msb') || norm.includes('maritime')) {
    return VIETQR_BANKS.find(b => b.bin === '970426') || VIETQR_BANKS[13];
  }
  if (norm.includes('ocb') || norm.includes('phuong dong')) {
    return VIETQR_BANKS.find(b => b.bin === '970448') || VIETQR_BANKS[14];
  }
  if (norm.includes('lienviet') || norm.includes('lpbank') || norm.includes('loc phat')) {
    return VIETQR_BANKS.find(b => b.bin === '970449') || VIETQR_BANKS[15];
  }
  if (norm.includes('sea') || norm.includes('seabank')) {
    return VIETQR_BANKS.find(b => b.bin === '970440') || VIETQR_BANKS[16];
  }
  if (norm.includes('exim') || norm.includes('eib')) {
    return VIETQR_BANKS.find(b => b.bin === '970431') || VIETQR_BANKS[17];
  }

  // If no specific match, try bankCode or fallback to Vietcombank
  return VIETQR_BANKS[0];
}

/**
 * Returns the BIN code for VietQR image generation
 */
export function getBankBinCode(bankName?: string, bankCode?: string): string {
  const info = getBankInfo(bankName, bankCode);
  return info.bin;
}

/**
 * Generates VietQR Napas 24/7 Payment URL
 */
export function buildVietQrUrl(
  paramsOrBin:
    | {
        bin: string;
        accountNumber: string;
        amount: number;
        memo?: string;
        accountName?: string;
        template?: 'compact2' | 'compact' | 'qr_only' | 'print';
      }
    | string,
  accountNumber?: string,
  amount?: number,
  memo?: string,
  accountName?: string
): string {
  let bin = '970436';
  let acc = '';
  let amt = 0;
  let mem = '';
  let name = '';
  let tmpl: 'compact2' | 'compact' | 'qr_only' | 'print' = 'compact2';

  if (typeof paramsOrBin === 'object') {
    bin = paramsOrBin.bin || '970436';
    acc = paramsOrBin.accountNumber || '';
    amt = paramsOrBin.amount || 0;
    mem = paramsOrBin.memo || '';
    name = paramsOrBin.accountName || '';
    tmpl = paramsOrBin.template || 'compact2';
  } else {
    bin = paramsOrBin || '970436';
    acc = accountNumber || '';
    amt = amount || 0;
    mem = memo || '';
    name = accountName || '';
  }

  const cleanBin = bin.trim() || '970436';
  const cleanAcc = acc.replace(/\s+/g, '').trim();
  const cleanAmt = Math.max(0, Math.round(amt));

  const url = new URL(`https://img.vietqr.io/image/${cleanBin}-${cleanAcc}-${tmpl}.png`);
  if (cleanAmt > 0) {
    url.searchParams.set('amount', String(cleanAmt));
  }
  if (mem) {
    url.searchParams.set('addInfo', mem);
  }
  if (name) {
    url.searchParams.set('accountName', name.toUpperCase());
  }

  return url.toString();
}
