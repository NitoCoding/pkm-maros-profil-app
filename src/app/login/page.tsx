'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import Image from 'next/image'
import {auth} from '@/libs/firebase'
import {
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
} from 'firebase/auth'
import { setAuthToken } from '@/libs/auth/token'

export default function LoginPage() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [googleLoading, setGoogleLoading] = useState(false)

	// Handler login Email/Password
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password,
			)
			const token = await userCredential.user.getIdToken()
			// Store the token
			setAuthToken(token)

			router.push('/admin')
		} catch (err: any) {
			setError(err.message || 'Login gagal')
		}
		setLoading(false)
	}

	// Handler login Google
	const handleGoogleLogin = async () => {
		setError(null)	
		setGoogleLoading(true)
		try {
			const provider = new GoogleAuthProvider()
			const result = await signInWithPopup(auth, provider)
			const token = await result.user.getIdToken()
			// Store the token
			setAuthToken(token)
			
			router.push('/admin')
		} catch (err: any) {
			setError(err.message || 'Gagal login dengan Google')
		}
		setGoogleLoading(false)
	}

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='bg-white p-8 rounded-lg shadow-md w-full max-w-sm'>
				<h1 className='text-2xl font-bold mb-6 w-full text-center'>Login</h1>
				<Image
					src='/logo.png'
					alt='Logo'
					width={100}
					height={100}
					className='mx-auto mb-4'
				/>
				<p className='text-gray-600 mb-4 w-full text-center'>
					Masuk ke akun Anda untuk mengelola konten Kelurahan Bilokka.
				</p>
				{error && (
					<div className='mb-4 text-red-600 text-center text-sm'>{error}</div>
				)}
				<form onSubmit={handleSubmit}>
					<div className='mb-4'>
						<label className='block text-sm font-medium mb-2' htmlFor='email'>
							Email
						</label>
						<input
							type='email'
							id='email'
							className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							value={email}
							onChange={e => setEmail(e.target.value)}
							autoComplete='username'
							required
							disabled={loading || googleLoading}
						/>
					</div>
					<div className='mb-6'>
						<label
							className='block text-sm font-medium mb-2'
							htmlFor='password'
						>
							Password
						</label>
						<input
							type='password'
							id='password'
							className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							value={password}
							onChange={e => setPassword(e.target.value)}
							autoComplete='current-password'
							required
							disabled={loading || googleLoading}
						/>
					</div>
					<button
						type='submit'
						className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors mb-3'
						disabled={loading || googleLoading}
					>
						{loading ? 'Loading...' : 'Login'}
					</button>
				</form>
				<div className='flex items-center my-4'>
					<div className='flex-grow border-t border-gray-300'></div>
					<span className='mx-2 text-gray-500 text-xs'>atau</span>
					<div className='flex-grow border-t border-gray-300'></div>
				</div>
				<button
					type='button'
					className='w-full border border-blue-600 text-black py-2 rounded hover:text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
					onClick={handleGoogleLogin}
					disabled={googleLoading || loading}
				>
					<Image src='/google.svg' alt='Google' width={24} height={24} />
					{googleLoading ? 'Loading...' : 'Login dengan Google'}
				</button>
			</div>
		</div>
	)
}
