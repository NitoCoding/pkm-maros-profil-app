
import { db } from "@/libs/firebase";
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  where
} from "firebase/firestore";

const umkmCollection = collection(db, "umkm");

export async function tambahUmkm(data: any) {
  const docRef = await addDoc(umkmCollection, data);
  return docRef.id;
}

export async function ambilUmkmPaginate(pageSize: number, cursor: QueryDocumentSnapshot<DocumentData> | null = null) {
  let q = query(umkmCollection, orderBy("createdAt", "desc"), limit(pageSize));
  
  if (cursor) {
    q = query(umkmCollection, orderBy("createdAt", "desc"), startAfter(cursor), limit(pageSize));
  }

  const querySnapshot = await getDocs(q);
  const data = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
  const hasMore = querySnapshot.docs.length === pageSize;
  
  return {
    data,
    lastDoc,
    hasMore
  };
}

export async function ambilUmkmById(id: string) {
  const docRef = doc(umkmCollection, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error("UMKM not found");
  }
  
  return {
    id: docSnap.id,
    ...docSnap.data()
  };
}

export async function ambilUmkmBySlug(slug: string) {
  const q = query(umkmCollection, where("slug", "==", slug));
  const querySnapshot = await getDocs(q);
  const umkmList = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return umkmList;
}

export async function updateUmkm(id: string, data: any) {
  const docRef = doc(umkmCollection, id);
  await updateDoc(docRef, data);
}

export async function hapusUmkm(id: string) {
  const docRef = doc(umkmCollection, id);
  await deleteDoc(docRef);
}
