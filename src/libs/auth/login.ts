import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/libs/firebase";

export async function login(email: string, password: string) {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		return userCredential.user;
	} catch (error: any) {
		throw new Error(error.message);
	}
}
