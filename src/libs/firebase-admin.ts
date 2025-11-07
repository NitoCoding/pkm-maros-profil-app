// // libs/firebase-admin.ts

// import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
// import { getAuth } from 'firebase-admin/auth'

// // Make sure this env contains a **valid JSON string** from Firebase service account
// const serviceAccount = JSON.parse(
// 	process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
// )

// let app: App

// if (getApps().length === 0) {
// 	app = initializeApp({
// 		credential: cert(serviceAccount),
// 	})
// } else {
// 	app = getApps()[0]
// }

// export const adminAuth = getAuth(app)
