import { db } from "@/libs/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const docRef = doc(db, "sarana_kesehatan", "default");

export async function getSaranaKesehatan() {
	const docSnap = await getDoc(docRef);
	return docSnap.exists() ? docSnap.data() : null;
}

export async function updateSaranaKesehatan(data: any) {
	await setDoc(docRef, data, { merge: true });
}
