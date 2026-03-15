import { jsPDF } from 'jspdf';

export interface ReceiptParams {
  paymentDate: string; // "2026/01/01"
  companyName: string;
  sumPrice: number;
  planName: string;
  receiptNumber: string;
}

const WYZE_INFO = {
  zipCode: '150-0000',
  address: '東京都渋谷区',
  address2: '',
  tel: '03-0000-0000',
  workspaceName: 'info@wyze-system.com',
  representative: 'Wyze System',
};

export function generateReceiptPDF(params: ReceiptParams): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // フォント設定（jsPDF標準フォントは日本語非対応のため英数字で代替表示）
  doc.setFont('helvetica');

  let y = 25;

  // タイトル
  doc.setFontSize(20);
  doc.text('RECEIPT', pageWidth / 2, y, { align: 'center' });
  y += 5;

  // 領収書 サブタイトル
  doc.setFontSize(10);
  doc.text('ryousyuusyo', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // 発行日
  const [yyyy, mm, dd] = params.paymentDate.split('/');
  doc.setFontSize(9);
  doc.text(`Date: ${yyyy}/${mm}/${dd}`, pageWidth - marginRight, y, { align: 'right' });
  y += 10;

  // 宛名（左）と発行者（右）
  doc.setFontSize(10);
  doc.text(params.companyName, marginLeft, y);
  doc.text('Wyze System', pageWidth - marginRight, y, { align: 'right' });
  y += 6;
  doc.setFontSize(8);
  doc.text(`TEL: ${WYZE_INFO.tel}`, pageWidth - marginRight, y, { align: 'right' });
  y += 5;
  doc.text(`E-mail: ${WYZE_INFO.workspaceName}`, pageWidth - marginRight, y, { align: 'right' });
  y += 15;

  // 領収書番号
  doc.setFontSize(9);
  doc.text(`Receipt No: ${params.receiptNumber}`, pageWidth - marginRight, y, { align: 'right' });
  y += 12;

  // 合計金額
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(marginLeft, y - 5, contentWidth, 18);
  doc.setFontSize(11);
  doc.text('Total (tax included)', marginLeft + 5, y + 3);
  doc.setFontSize(16);
  const formattedPrice = `JPY ${new Intl.NumberFormat('ja-JP').format(params.sumPrice)}`;
  doc.text(formattedPrice, pageWidth - marginRight - 5, y + 3, { align: 'right' });
  y += 25;

  // 但し書き
  doc.setFontSize(9);
  doc.text('For: System usage fee. The above amount has been duly received.', marginLeft, y);
  y += 15;

  // 領収明細ヘッダー
  doc.setFontSize(11);
  doc.text('Details', marginLeft, y);
  y += 8;

  // テーブルヘッダー
  doc.setFontSize(9);
  doc.setFillColor(240, 240, 240);
  doc.rect(marginLeft, y - 4, contentWidth, 8, 'F');
  doc.text('Date', marginLeft + 3, y);
  doc.text('Plan', marginLeft + 40, y);
  doc.text('Amount (tax incl.)', pageWidth - marginRight - 3, y, { align: 'right' });
  y += 10;

  // 明細行
  doc.setFontSize(9);
  doc.text(`${yyyy}/${mm}`, marginLeft + 3, y);
  doc.text(params.planName, marginLeft + 40, y);
  doc.text(`JPY ${new Intl.NumberFormat('ja-JP').format(params.sumPrice)}`, pageWidth - marginRight - 3, y, { align: 'right' });
  y += 8;

  // 区切り線
  doc.setLineWidth(0.3);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;

  // 合計
  doc.setFontSize(10);
  doc.text('Total (tax incl.)', marginLeft + 40, y);
  doc.text(`JPY ${new Intl.NumberFormat('ja-JP').format(params.sumPrice)}`, pageWidth - marginRight - 3, y, { align: 'right' });
  y += 6;

  // 税率内訳
  doc.setFontSize(8);
  doc.text(`(10% tax: JPY ${new Intl.NumberFormat('ja-JP').format(Math.round(params.sumPrice * 10 / 110))})`, pageWidth - marginRight - 3, y, { align: 'right' });
  y += 15;

  // 備考
  doc.setFontSize(9);
  doc.text('Remarks:', marginLeft, y);
  y += 6;
  doc.setFontSize(8);
  doc.text('Thank you for your patronage.', marginLeft, y);

  // ダウンロード
  doc.save(`receipt_${params.receiptNumber}.pdf`);
}
