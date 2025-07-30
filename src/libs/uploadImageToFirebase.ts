import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadImageToFirebase(
	file: File,
	path = "berita-images"
) {
	const fileRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
	await uploadBytes(fileRef, file);
	return await getDownloadURL(fileRef);
}
