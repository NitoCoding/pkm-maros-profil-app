export interface IUmum {
  id: string;
  jenis: 'infografi' | 'penduduk' | 'saranaPendidikan' | 'saranaKesehatan' | 'geografi';
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

    // Untuk geografi
    geografi?: {
      luasWilayah: number;
      jumlahDusun: number;
      batasUtara: string;
      batasSelatan: string;
      batasTimur: string;
      batasBarat: string;
      koordinat: {
        latitude: number;
        longitude: number;
      };
      kondisiGeografis: string;
      potensiAlam: string;
      penggunaanLahan: {
        pertanian: number;
        perumahan: number;
        hutan: number;
        lainnya: number;
      };
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

export interface IGeografi {
  luasWilayah: number;
  jumlahDusun: number;
  batasUtara: string;
  batasSelatan: string;
  batasTimur: string;
  batasBarat: string;
  koordinat: {
    latitude: number;
    longitude: number;
  };
  kondisiGeografis: string;
  potensiAlam: string;
  penggunaanLahan: {
    pertanian: number;
    perumahan: number;
    hutan: number;
    lainnya: number;
  };
} 