import { db } from "@/libs/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { IUmum } from "@/types/umum";

const docRef = doc(db, "umum_kelurahan", "default");

export async function getUmumKelurahan(): Promise<IUmum[] | null> {
	const docSnap = await getDoc(docRef);
	if (!docSnap.exists()) return null;
	
	const data = docSnap.data();
	// Jika data adalah array, return langsung
	if (Array.isArray(data)) {
		return data as IUmum[];
	}
	// Jika data adalah object dengan field 'data', return data.data
	if (data && typeof data === 'object' && 'data' in data) {
		return data.data as IUmum[];
	}
	// Fallback: return null
	return null;
}

export async function updateUmumKelurahan(data: IUmum[]): Promise<void> {
	await setDoc(docRef, { data }, { merge: true });
}

// Fungsi untuk mendapatkan umum berdasarkan jenis
export async function getUmumByJenis(jenis: IUmum['jenis']): Promise<IUmum | null> {
	const data = await getUmumKelurahan();
	if (!data) return null;
	
	return data.find(item => item.jenis === jenis) || null;
}

// Fungsi untuk update umum berdasarkan jenis
export async function updateUmumByJenis(jenis: IUmum['jenis'], updateData: Partial<IUmum>): Promise<void> {
	const currentData = await getUmumKelurahan() || [];
	
	// Cari item yang sudah ada
	const existingIndex = currentData.findIndex(item => item.jenis === jenis);
	
	if (existingIndex >= 0) {
		// Update item yang sudah ada
		currentData[existingIndex] = {
			...currentData[existingIndex],
			...updateData,
			updatedAt: new Date().toISOString()
		};
	} else {
		// Tambah item baru jika belum ada
		const newItem: IUmum = {
			id: jenis, // Gunakan jenis sebagai ID
			jenis,
			...updateData,
			updatedAt: new Date().toISOString()
		} as IUmum;
		currentData.push(newItem);
	}
	
	// Simpan kembali ke Firestore
	await setDoc(docRef, { data: currentData }, { merge: true });
}

// Fungsi untuk inisialisasi data umum default
export async function initializeUmumData(): Promise<void> {
	const currentData = await getUmumKelurahan();
	if (currentData && currentData.length > 0) return; // Sudah ada data
	
	const defaultData: IUmum[] = [
		{
			id: 'infografi',
			jenis: 'infografi',
			judul: 'Infografi',
			deskripsi: 'Data Demografi Kelurahan Bilokka',
			data: {
				infografi: {
					judul: 'Data Demografi Kelurahan Bilokka',
					deskripsi: 'Infografi yang menampilkan data demografi dan statistik Kelurahan Bilokka',
					gambar: ''
				}
			},
			updatedAt: new Date().toISOString()
		},
		{
			id: 'penduduk',
			jenis: 'penduduk',
			judul: 'Administrasi Penduduk',
			deskripsi: 'Data kependudukan Kelurahan Bilokka',
			data: {
				penduduk: {
					total: 3075,
					lakiLaki: 1109,
					perempuan: 1218,
					kk: 683,
					wajibPilih: 2222
				}
			},
			updatedAt: new Date().toISOString()
		},
		{
			id: 'saranaPendidikan',
			jenis: 'saranaPendidikan',
			judul: 'Sarana Pendidikan',
			deskripsi: 'Data sarana pendidikan Kelurahan Bilokka',
			data: {
				saranaPendidikan: {
					tk: 2,
					sd: 2,
					smp: 1,
					sma: 0
				}
			},
			updatedAt: new Date().toISOString()
		},
		{
			id: 'saranaKesehatan',
			jenis: 'saranaKesehatan',
			judul: 'Sarana Kesehatan',
			deskripsi: 'Data sarana kesehatan Kelurahan Bilokka',
			data: {
				saranaKesehatan: {
					puskesmas: 1,
					pustu: 1,
					posyandu: 2,
					puskesdes: 1
				}
			},
			updatedAt: new Date().toISOString()
		}
	];
	
	await setDoc(docRef, { data: defaultData }, { merge: true });
}
