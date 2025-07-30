export interface IUMKM {
    id: string;
    nama: string;
    kategori: string;
    deskripsi: string;
    gambar: string;
    startPrice: number;
    endPrice: number;
    telepon: string;
    lokasi: {
        alamat: string;
        latitude: number;
        longitude: number;
        googleMapsLink?: string;
    };
}
