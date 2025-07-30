import { db } from "@/libs/firebase";
import {
	collection,
	addDoc,
	getDocs,
	getDoc,
	doc,
	deleteDoc,
	updateDoc,
	query,
	orderBy,
	limit as fslimit,
	startAfter,
	DocumentData,
	QueryDocumentSnapshot,
} from "firebase/firestore";

const pegawaiRef = collection(db, "pegawai");

/**
 * Tambah pegawai baru
 */
export async function tambahPegawai(data: any) {
	const docRef = await addDoc(pegawaiRef, data);
	return { id: docRef.id, ...data };
}

/**
 * Ambil semua pegawai dengan limit & pagination.
 * @param {number} pageSize  Jumlah pegawai per halaman.
 * @param {QueryDocumentSnapshot<DocumentData> | null} cursor  Dokumen terakhir dari halaman sebelumnya.
 * @returns {object}  Object: { data, lastDoc, hasMore }
 */
export async function ambilPegawaiPaginate(
	pageSize: number,
	cursor: QueryDocumentSnapshot<DocumentData> | null = null
) {
	let q;
	if (cursor) {
		q = query(
			pegawaiRef,
			orderBy("urutanTampil", "asc"), // Sort by urutanTampil ascending
			startAfter(cursor),
			fslimit(pageSize)
		);
	} else {
		q = query(pegawaiRef, orderBy("urutanTampil", "asc"), fslimit(pageSize));
	}
	const snap = await getDocs(q);
	const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
	const hasMore = snap.docs.length === pageSize;
	return { data, lastDoc, hasMore };
}

/**
 * Ambil satu pegawai berdasarkan id
 */
export async function ambilPegawaiById(id: string) {
	const ref = doc(db, "pegawai", id);
	const snapshot = await getDoc(ref);
	if (!snapshot.exists()) throw new Error("Pegawai tidak ditemukan");
	return { id: snapshot.id, ...snapshot.data() };
}

/**
 * Update pegawai berdasarkan id
 */
export async function updatePegawai(id: string, data: any) {
	const ref = doc(db, "pegawai", id);
	await updateDoc(ref, data);
}

/**
 * Hapus pegawai berdasarkan id
 */
export async function hapusPegawai(id: string) {
	const ref = doc(db, "pegawai", id);
	await deleteDoc(ref);
} 