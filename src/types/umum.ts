export interface IUmum {
  id: string;
  jenis: 'infografi' | 'penduduk' | 'saranaPendidikan' | 'saranaKesehatan';
  judul: string;
  deskripsi?: string;
  gambar?: string;
  data: {
    // Untuk infografi
    infografi?: {
      judul: string;
      deskripsi: string;
      gambar: string;
    };
    
    // Untuk penduduk
    penduduk?: {
      total: number;
      lakiLaki: number;
      perempuan: number;
      kk: number;
      wajibPilih: number;
    };
    
    // Untuk sarana pendidikan
    saranaPendidikan?: {
      tk: number;
      sd: number;
      smp: number;
      sma: number;
    };
    
    // Untuk sarana kesehatan
    saranaKesehatan?: {
      puskesmas: number;
      pustu: number;
      posyandu: number;
      puskesdes: number;
    };
  };
  updatedAt: string;
}

export interface IInfografi {
  judul: string;
  deskripsi: string;
  gambar: string;
}

export interface IPenduduk {
  total: number;
  lakiLaki: number;
  perempuan: number;
  kk: number;
  wajibPilih: number;
}

export interface ISaranaPendidikan {
  tk: number;
  sd: number;
  smp: number;
  sma: number;
}

export interface ISaranaKesehatan {
  puskesmas: number;
  pustu: number;
  posyandu: number;
  puskesdes: number;
} 