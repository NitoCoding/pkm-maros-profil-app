import { db } from "@/libs/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const docRef = doc(db, "demografi", "default");

export async function getDemografi() {
	const docSnap = await getDoc(docRef);
	return docSnap.exists() ? docSnap.data() : null;
}

export async function updateDemografi(data: any) {
	await setDoc(docRef, data, { merge: true });
}
