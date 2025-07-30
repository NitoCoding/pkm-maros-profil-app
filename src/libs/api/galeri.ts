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

const galeriRef = collection(db, "galeri");

/**
 * Tambah galeri baru
 */
export async function tambahGaleri(data: any) {
	const docRef = await addDoc(galeriRef, data);
	return { id: docRef.id, ...data };
}

/**
 * Ambil semua galeri dengan limit & pagination.
 * @param {number} pageSize  Jumlah galeri per halaman.
 * @param {QueryDocumentSnapshot<DocumentData> | null} cursor  Dokumen terakhir dari halaman sebelumnya.
 * @returns {object}  Object: { data, lastDoc, hasMore }
 */
export async function ambilGaleriPaginate(
	pageSize: number,
	cursor: QueryDocumentSnapshot<DocumentData> | null = null
) {
	let q;
	if (cursor) {
		q = query(
			galeriRef,
			orderBy("createdAt", "desc"),
			startAfter(cursor),
			fslimit(pageSize)
		);
	} else {
		q = query(galeriRef, orderBy("createdAt", "desc"), fslimit(pageSize));
	}
	const snap = await getDocs(q);
	const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
	const hasMore = snap.docs.length === pageSize;
	return { data, lastDoc, hasMore };
}

/**
 * Ambil satu galeri berdasarkan id
 */
export async function ambilGaleriById(id: string) {
	const ref = doc(db, "galeri", id);
	const snapshot = await getDoc(ref);
	if (!snapshot.exists()) throw new Error("Galeri tidak ditemukan");
	return { id: snapshot.id, ...snapshot.data() };
}

/**
 * Update galeri berdasarkan id
 */
export async function updateGaleri(id: string, data: any) {
	const ref = doc(db, "galeri", id);
	await updateDoc(ref, data);
}

/**
 * Hapus galeri berdasarkan id
 */
export async function hapusGaleri(id: string) {
	const ref = doc(db, "galeri", id);
	await deleteDoc(ref);
}
