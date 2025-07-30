import { db } from "@/libs/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { IProfil } from "@/types/profil";

const docRef = doc(db, "profil_kelurahan", "default");

export async function getProfilKelurahan(): Promise<IProfil[] | null> {
	const docSnap = await getDoc(docRef);
	if (!docSnap.exists()) return null;
	
	const data = docSnap.data();
	// Jika data adalah array, return langsung
	if (Array.isArray(data)) {
		return data as IProfil[];
	}
	// Jika data adalah object dengan field 'data', return data.data
	if (data && typeof data === 'object' && 'data' in data) {
		return data.data as IProfil[];
	}
	// Fallback: return null
	return null;
}

export async function updateProfilKelurahan(data: IProfil[]): Promise<void> {
	await setDoc(docRef, { data }, { merge: true });
}

// Fungsi untuk mendapatkan profil berdasarkan jenis
export async function getProfilByJenis(jenis: IProfil['jenis']): Promise<IProfil | null> {
	const data = await getProfilKelurahan();
	if (!data) return null;
	
	return data.find(item => item.jenis === jenis) || null;
}

// Fungsi untuk update profil berdasarkan jenis
export async function updateProfilByJenis(jenis: IProfil['jenis'], updateData: Partial<IProfil>): Promise<void> {
	const currentData = await getProfilKelurahan() || [];
	
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
		const newItem: IProfil = {
			id: jenis, // Gunakan jenis sebagai ID
			jenis,
			...updateData,
			updatedAt: new Date().toISOString()
		} as IProfil;
		currentData.push(newItem);
	}
	
	// Simpan kembali ke Firestore
	await setDoc(docRef, { data: currentData }, { merge: true });
}

// Fungsi untuk inisialisasi data profil default
export async function initializeProfilData(): Promise<void> {
	const currentData = await getProfilKelurahan();
	if (currentData && currentData.length > 0) return; // Sudah ada data
	
	const defaultData: IProfil[] = [
		{
			id: 'sambutan',
			jenis: 'sambutan',
			judul: 'Sambutan Lurah',
			isi: 'Sambutan dari Lurah Kelurahan Bilokka...',
			updatedAt: new Date().toISOString()
		},
		{
			id: 'sejarah',
			jenis: 'sejarah',
			judul: 'Sejarah Singkat',
			isi: 'Kelurahan Bilokka berdiri pada tahun 1980...',
			updatedAt: new Date().toISOString()
		},
		{
			id: 'visi',
			jenis: 'visi',
			judul: 'Visi',
			isi: 'Menjadi kelurahan terdepan dalam inovasi dan keberlanjutan...',
			updatedAt: new Date().toISOString()
		},
		{
			id: 'misi',
			jenis: 'misi',
			judul: 'Misi',
			isi: '1. Meningkatkan kualitas hidup melalui teknologi ramah lingkungan.\n2. Memberdayakan komunitas lokal dengan pendidikan dan pelatihan.\n3. Membangun kemitraan strategis untuk dampak global.',
			updatedAt: new Date().toISOString()
		},
		{
			id: 'struktur',
			jenis: 'struktur',
			judul: 'Struktur Organisasi',
			gambar: '',
			updatedAt: new Date().toISOString()
		},
		{
			id: 'video',
			jenis: 'video',
			judul: 'Video',
			videoUrl: '',
			updatedAt: new Date().toISOString()
		}
	];
	
	await setDoc(docRef, { data: defaultData }, { merge: true });
}
