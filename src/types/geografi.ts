export interface IGeografi {
    nama?: string; // opsional, jika ada nama wilayah
    luasWilayah: number;
    jumlahDesa?: number;
    Desa?: { id: string; nama: string; }[]; // opsional, jika ada informasi tentang desa
    lingkungan?: { id: string; nama: string; }[]; // opsional, jika ada informasi tentang lingkungan
    jumlahDusun?: number;
    jumlahRW?: number;
    jumlahRT?: number;
    batasUtara: string;
    batasSelatan: string;
    batasTimur: string;
    batasBarat: string;
    ketinggian?: number;
    koordinat: {
        latitude: number;
        longitude: number;
    };
    kondisiGeografis: string;
    potensiAlam: string;
    penggunaanLahan?: { [key: string]: number}; // opsional, jika ada informasi tentang penggunaan lahan
}

// berikan contoh implementasi IGeografi
const contohGeografi: IGeografi = {
    luasWilayah: 150.5,
    jumlahDesa: 10,
    jumlahDusun: 25,
    jumlahRW: 50,
    jumlahRT: 200,
    batasUtara: 'Sungai Besar',
    batasSelatan: 'Gunung Tinggi',
    batasTimur: 'Laut Selatan',
    batasBarat: 'Hutan Lindung',
    ketinggian: 300,
    koordinat: {
        latitude: -7.123456,
        longitude: 110.123456
    },
    kondisiGeografis: 'Daerah pegunungan dengan sungai yang mengalir di tengahnya.',
    potensiAlam: 'Pertanian, perikanan, dan pariwisata alam.',
    penggunaanLahan: {
        pertanian: 60,
        perumahan: 20,
        hutan: 15,
        lainnya: 5
    }
};