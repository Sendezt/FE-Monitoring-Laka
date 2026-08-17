export type ReportStatus = 'Selesai' | 'Dalam Proses' | 'Draft'
export type StatusTone = 'success' | 'warning' | 'muted'
export type RecentReport = { id: string; place: string; date: string; status: ReportStatus; tone: StatusTone }
export type Vehicle = { plate: string; type: string; brand: string; driver: string }
export type Victim = { name: string; status: string; vehicle: string }
