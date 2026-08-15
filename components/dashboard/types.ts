export interface LpRecord {
  id: string;
  noLp: string;
  tanggal: string;
  polres: string;
  lokasi: string;
  jenisLaka: "Laka Tunggal" | "Ganda" | "Beruntun";
  jumlahKorban: number;
  lukaLuka: number;
  llMd: number;
  md: number;
  statusLapor: "NORMAL" | "1-3 HARI" | "4-7 HARI" | ">7 HARI";
  statusJaminan: "TERJAMIN" | "TIDAK TERJAMIN" | "EG2R";
}

export interface KpiStats {
  totalLp: string;
  totalLpLoading?: boolean;
  totalLpError?: boolean;
  totalLpErrorMessage?: string | null;
  totalLpSource?: "api" | "fallback";
  onRetryTotalLp?: () => void;
  lakaTunggal: string;
  lakaTunggalPct: string;
  lakaTunggalLoading?: boolean;
  lakaTunggalError?: boolean;
  lakaTunggalErrorMessage?: string | null;
  lakaTunggalSource?: "api" | "fallback";
  onRetryLakaTunggal?: () => void;
  jumlahKorban: string;
  jumlahKorbanLoading?: boolean;
  jumlahKorbanError?: boolean;
  jumlahKorbanErrorMessage?: string | null;
  jumlahKorbanSource?: "api" | "fallback";
  onRetryJumlahKorban?: () => void;
  lukaLuka: string;
  lukaLukaLoading?: boolean;
  lukaLukaError?: boolean;
  lukaLukaErrorMessage?: string | null;
  lukaLukaSource?: "api" | "fallback";
  onRetryLukaLuka?: () => void;
  llMd: string;
  llMdLoading?: boolean;
  llMdError?: boolean;
  llMdErrorMessage?: string | null;
  llMdSource?: "api" | "fallback";
  onRetryLlMd?: () => void;
  md: string;
  mdLoading?: boolean;
  mdError?: boolean;
  mdErrorMessage?: string | null;
  mdSource?: "api" | "fallback";
  onRetryMd?: () => void;
  terlambatLapor: string;
  terlambatPct: string;
  terlambatLaporLoading?: boolean;
  terlambatLaporError?: boolean;
  terlambatLaporErrorMessage?: string | null;
  terlambatLaporSource?: "api" | "fallback";
  onRetryTerlambatLapor?: () => void;
  late3Days: { count: string; pct: string };
  late7Days: { count: string; pct: string };
  lateMoreDays: { count: string; pct: string };
  normal: string;
  normalPct: string;
  normalLoading?: boolean;
  normalError?: boolean;
  normalErrorMessage?: string | null;
  normalSource?: "api" | "fallback";
  onRetryNormal?: () => void;
  terjamin: string;
  terjaminLoading?: boolean;
  terjaminError?: boolean;
  terjaminErrorMessage?: string | null;
  terjaminSource?: "api" | "fallback";
  onRetryTerjamin?: () => void;
  tidakTerjamin: string;
  tidakTerjaminLoading?: boolean;
  tidakTerjaminError?: boolean;
  tidakTerjaminErrorMessage?: string | null;
  tidakTerjaminSource?: "api" | "fallback";
  onRetryTidakTerjamin?: () => void;
  eg2r: string;
  eg2rLoading?: boolean;
  eg2rError?: boolean;
  eg2rErrorMessage?: string | null;
  eg2rSource?: "api" | "fallback";
  onRetryEg2r?: () => void;
}

export interface ChartItem {
  polres: string;
  lp: number;
  korban: number;
  late: number;
}

export const POLRES_LIST = [
  "ALL",
  "POLRESTABES SEMARANG",
  "POLRESTA SURAKARTA",
  "POLRES MAGELANG",
  "POLRES BANYUMAS",
  "POLRES CILACAP",
  "POLRES KUDUS",
  "POLRES TEGAL",
  "POLRES PEKALONGAN",
];

export const INITIAL_RECORDS: LpRecord[] = [
  {
    id: "1",
    noLp: "LP/A/0821/VIII/2026/SPKT/POLRESTABES SEMARANG",
    tanggal: "2026-08-12",
    polres: "POLRESTABES SEMARANG",
    lokasi: "Jl. Pandanaran No. 45, Semarang Tengah",
    jenisLaka: "Ganda",
    jumlahKorban: 3,
    lukaLuka: 2,
    llMd: 1,
    md: 0,
    statusLapor: "NORMAL",
    statusJaminan: "TERJAMIN",
  },
  {
    id: "2",
    noLp: "LP/A/0412/VIII/2026/SPKT/POLRESTA SURAKARTA",
    tanggal: "2026-08-11",
    polres: "POLRESTA SURAKARTA",
    lokasi: "Jl. Slamet Riyadi, Banjarsari",
    jenisLaka: "Laka Tunggal",
    jumlahKorban: 1,
    lukaLuka: 0,
    llMd: 0,
    md: 1,
    statusLapor: "1-3 HARI",
    statusJaminan: "TERJAMIN",
  },
  {
    id: "3",
    noLp: "LP/A/0198/VIII/2026/SPKT/POLRES MAGELANG",
    tanggal: "2026-08-10",
    polres: "POLRES MAGELANG",
    lokasi: "Jl. Raya Jogja-Magelang KM 12",
    jenisLaka: "Beruntun",
    jumlahKorban: 5,
    lukaLuka: 3,
    llMd: 1,
    md: 1,
    statusLapor: "4-7 HARI",
    statusJaminan: "TIDAK TERJAMIN",
  },
  {
    id: "4",
    noLp: "LP/A/0754/VIII/2026/SPKT/POLRES BANYUMAS",
    tanggal: "2026-08-09",
    polres: "POLRES BANYUMAS",
    lokasi: "Jl. Jend. Soedirman, Purwokerto",
    jenisLaka: "Ganda",
    jumlahKorban: 2,
    lukaLuka: 2,
    llMd: 0,
    md: 0,
    statusLapor: "NORMAL",
    statusJaminan: "TERJAMIN",
  },
  {
    id: "5",
    noLp: "LP/A/0331/VIII/2026/SPKT/POLRES CILACAP",
    tanggal: "2026-08-08",
    polres: "POLRES CILACAP",
    lokasi: "Jl. Gatot Subroto, Cilacap Selatan",
    jenisLaka: "Laka Tunggal",
    jumlahKorban: 1,
    lukaLuka: 0,
    llMd: 0,
    md: 1,
    statusLapor: ">7 HARI",
    statusJaminan: "EG2R",
  },
  {
    id: "6",
    noLp: "LP/A/0612/VIII/2026/SPKT/POLRESTABES SEMARANG",
    tanggal: "2026-08-07",
    polres: "POLRESTABES SEMARANG",
    lokasi: "Jl. Pemuda No. 120, Semarang",
    jenisLaka: "Ganda",
    jumlahKorban: 4,
    lukaLuka: 3,
    llMd: 1,
    md: 0,
    statusLapor: "NORMAL",
    statusJaminan: "TERJAMIN",
  },
  {
    id: "7",
    noLp: "LP/A/0225/VIII/2026/SPKT/POLRES KUDUS",
    tanggal: "2026-08-05",
    polres: "POLRES KUDUS",
    lokasi: "Jl. Lingkar Kudus-Pati",
    jenisLaka: "Laka Tunggal",
    jumlahKorban: 2,
    lukaLuka: 1,
    llMd: 1,
    md: 0,
    statusLapor: "1-3 HARI",
    statusJaminan: "TERJAMIN",
  },
  {
    id: "8",
    noLp: "LP/A/0489/VIII/2026/SPKT/POLRES TEGAL",
    tanggal: "2026-08-03",
    polres: "POLRES TEGAL",
    lokasi: "Jl. Raya Pantura Tegal",
    jenisLaka: "Beruntun",
    jumlahKorban: 6,
    lukaLuka: 4,
    llMd: 1,
    md: 1,
    statusLapor: "NORMAL",
    statusJaminan: "TERJAMIN",
  },
];

export const CHART_DATA: ChartItem[] = [
  { polres: "SEMARANG", lp: 340, korban: 280, late: 24 },
  { polres: "SURAKARTA", lp: 210, korban: 175, late: 18 },
  { polres: "MAGELANG", lp: 185, korban: 140, late: 15 },
  { polres: "BANYUMAS", lp: 160, korban: 125, late: 12 },
  { polres: "CILACAP", lp: 140, korban: 110, late: 10 },
  { polres: "KUDUS", lp: 115, korban: 90, late: 8 },
  { polres: "TEGAL", lp: 84, korban: 70, late: 5 },
];
