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
	where,
} from "firebase/firestore";

const beritaRef = collection(db, "berita");

/**
 * Tambah berita baru
 */
export async function tambahBerita(data: any) {
	const docRef = await addDoc(beritaRef, data);
	return { id: docRef.id, ...data };
}

/**
 * Ambil semua berita dengan limit & pagination.
 * @param {number} pageSize  Jumlah berita per halaman.
 * @param {QueryDocumentSnapshot<DocumentData> | null} cursor  Dokumen terakhir dari halaman sebelumnya.
 * @returns {object}  Object: { data, lastDoc, hasMore }
 */
export async function ambilBeritaPaginate(
	pageSize: number,
	cursor: QueryDocumentSnapshot<DocumentData> | null = null
) {
	let q;
	if (cursor) {
		q = query(
			beritaRef,
			where("status", "==", "published"),
			orderBy("createdAt", "desc"),
			startAfter(cursor),
			fslimit(pageSize)
		);
	} else {
		q = query(
			beritaRef, 
			where("status", "==", "published"),
			orderBy("createdAt", "desc"), 
			fslimit(pageSize)
		);
	}
	const snap = await getDocs(q);
	const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
	const hasMore = snap.docs.length === pageSize;
	return { data, lastDoc, hasMore };
}

/**
 * Ambil satu berita berdasarkan id
 */
export async function ambilBeritaById(id: string) {
	const ref = doc(db, "berita", id);
	const snapshot = await getDoc(ref);
	if (!snapshot.exists()) throw new Error("Berita tidak ditemukan");
	return { id: snapshot.id, ...snapshot.data() };
}

/**
 * Ambil satu berita berdasarkan slug
 * @param {string} slug  Slug berita yang ingin diambil.
 */
export async function ambilBeritaBySlug(slug: string) {
	const q = query(
		beritaRef, 
		where("slug", "==", slug),
		where("status", "==", "published")
	);
	const snapshot = await getDocs(q);
	if (snapshot.empty) throw new Error("Berita tidak ditemukan");
	return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0];
}

/**
 * Update berita berdasarkan id
 */
export async function updateBerita(id: string, data: any) {
	const ref = doc(db, "berita", id);
	await updateDoc(ref, data);
}

/**
 * Hapus berita berdasarkan id
 */
export async function hapusBerita(id: string) {
	const ref = doc(db, "berita", id);
	await deleteDoc(ref);
}

/**
 * Ambil semua berita dengan limit & pagination (untuk admin - termasuk draft)
 * @param {number} pageSize  Jumlah berita per halaman.
 * @param {QueryDocumentSnapshot<DocumentData> | null} cursor  Dokumen terakhir dari halaman sebelumnya.
 * @returns {object}  Object: { data, lastDoc, hasMore }
 */
export async function ambilBeritaPaginateAdmin(
	pageSize: number,
	cursor: QueryDocumentSnapshot<DocumentData> | null = null
) {
	let q;
	if (cursor) {
		q = query(
			beritaRef,
			orderBy("createdAt", "desc"),
			startAfter(cursor),
			fslimit(pageSize)
		);
	} else {
		q = query(beritaRef, orderBy("createdAt", "desc"), fslimit(pageSize));
	}
	const snap = await getDocs(q);
	const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
	const hasMore = snap.docs.length === pageSize;
	return { data, lastDoc, hasMore };
}

/**
 * Ambil satu berita berdasarkan slug (untuk admin - termasuk draft)
 * @param {string} slug  Slug berita yang ingin diambil.
 */
export async function ambilBeritaBySlugAdmin(slug: string) {
	const q = query(beritaRef, where("slug", "==", slug));
	const snapshot = await getDocs(q);
	if (snapshot.empty) throw new Error("Berita tidak ditemukan");
	return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0];
}
