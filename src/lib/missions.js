export const MISSIONS = [
  {
    id: 'mission-001',
    name: 'DTM',
    qr_code: '001',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'music',
    color: '#00f5ff',
    order: 1,
  },
  {
    id: 'mission-002',
    name: 'UNITY',
    qr_code: '002',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'gamepad',
    color: '#ff00ff',
    order: 2,
  },
  {
    id: 'mission-003',
    name: 'YUVRTECH',
    qr_code: '003',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'layers',
    color: '#00ff88',
    order: 3,
  },
  {
    id: 'mission-004',
    name: 'ANIME',
    qr_code: '004',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'film',
    color: '#ff6b00',
    order: 4,
  },
  {
    id: 'mission-005',
    name: 'LIT',
    qr_code: '005',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'book-open',
    color: '#ffd700',
    order: 5,
  },
  {
    id: 'mission-006',
    name: 'VIDEO',
    qr_code: '006',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'video',
    color: '#ff4444',
    order: 6,
  },
  {
    id: 'mission-007',
    name: 'TRPG',
    qr_code: '007',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'dice',
    color: '#9b59b6',
    order: 7,
  },
  {
    id: 'mission-008',
    name: 'TOPSION',
    qr_code: '008',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'divide',
    color: '#00bcd4',
    order: 8,
  },
  {
    id: 'mission-009',
    name: 'INFO',
    qr_code: '009',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'info',
    color: '#4caf50',
    order: 9,
  },
  {
    id: 'mission-010',
    name: 'FELICE',
    qr_code: '010',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'heart',
    color: '#e91e63',
    order: 10,
  },
  {
    id: 'mission-011',
    name: 'METAVERSE',
    qr_code: '011',
    description: 'ブースを訪れてQRをスキャン',
    icon: 'globe',
    color: '#3f51b5',
    order: 11,
  },
];

/**
 * QRコード（数字のみ）からミッションを解決する。
 * "1", "01", "001" のいずれの形式にも対応。
 */
export function resolveMissionByQR(rawQR) {
  const digits = rawQR.trim().replace(/\D/g, '');
  if (!digits) return null;
  const padded = digits.padStart(3, '0');
  return MISSIONS.find((m) => m.qr_code === padded) || null;
}
