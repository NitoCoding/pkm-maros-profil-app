import { db } from "@/libs/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const docRef = doc(db, "sarana_pendidikan", "default");

export async function getSaranaPendidikan() {
	const docSnap = await getDoc(docRef);
	return docSnap.exists() ? docSnap.data() : null;
}

export async function updateSaranaPendidikan(data: any) {
	await setDoc(docRef, data, { merge: true });
}
