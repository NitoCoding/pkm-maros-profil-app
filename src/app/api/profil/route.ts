// src/app/api/profil/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
	getProfilKelurahan,
	upsertProfil,
	getProfilByJenis,
	deleteProfilByJenis
} from '@/libs/api/profil';
// import { getUserFromRequest } from '@/libs/auth/token'; // Pastikan Anda memiliki fungsi ini

// Middleware akan menangani autentikasi dan menambahkan info user ke header
function getUserFromRequest(request: NextRequest) {
	const userId = request.headers.get('x-user-id');
	const userEmail = request.headers.get('x-user-email');
	const userName = request.headers.get('x-user-name');

	if (!userId || !userEmail) {
		return null;
	}

	return { userId, userEmail, userName };
}

const allowedJenis = ["visi", "misi", "sejarah", "struktur", "sambutan", "video", "lainnya"] as const;
type JenisProfil = typeof allowedJenis[number];

function isValidJenis(value: any): value is JenisProfil {
	return allowedJenis.includes(value);
}

// GET /api/profil - Get all or specific profil (PUBLIC - no auth required)
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const jenis = searchParams.get('jenis');

		if (!jenis || !isValidJenis(jenis)) {
			return NextResponse.json(
				{ success: false, error: 'Parameter jenis tidak valid' },
				{ status: 400 }
			);
		}

		// ✅ Sekarang TypeScript tahu jenis adalah JenisProfil
		const profil = await getProfilByJenis(jenis);
		if (!profil) {
			return NextResponse.json(
				{ success: false, error: 'Profil tidak ditemukan' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, data: profil });
	} catch (error: any) {
		console.error('Error in GET /api/profil:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// POST /api/profil - Create or update profil
export async function POST(request: NextRequest) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const data = await request.json();

		// Cek apakah `data` adalah array (untuk bulk update) atau objek tunggal
		if (Array.isArray(data)) {
			// Bulk update
			for (const item of data) {
				await upsertProfil(item);
			}
			return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' });
		} else if (typeof data === 'object' && data !== null) {
			// Single update/insert
			const result = await upsertProfil(data);
			return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' });
		} else {
			return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
		}
	} catch (error: any) {
		console.error('Error in POST /api/profil:', error);
		return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
}

// PUT /api/profil - Update profil by jenis
export async function PUT(request: NextRequest) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { jenis, ...updateData } = await request.json();

		if (!jenis) {
			return NextResponse.json({ error: 'Jenis parameter is required' }, { status: 400 });
		}

		const success = await upsertProfil({ ...updateData, jenis });

		if (!success) {
			return NextResponse.json({ error: 'Failed to update profil' }, { status: 400 });
		}

		return NextResponse.json({
			success: true,
			message: `Profil ${jenis} berhasil diperbarui`
		});
	} catch (error: any) {
		console.error('Error in PUT /api/profil:', error);
		return NextResponse.json({ success: false, error: 'Internal server error' }, {
			status: 500
		});
	}
}

// DELETE /api/profil - Delete profil by jenis
export async function DELETE(request: NextRequest) {
	try {
		const user = getUserFromRequest(request);
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { jenis } = await request.json();

		if (!jenis) {
			return NextResponse.json({ error: 'Jenis parameter is required' }, { status: 400 });
		}

		const success = await deleteProfilByJenis(jenis);

		if (!success) {
			return NextResponse.json({ error: 'Failed to delete profil' }, { status: 400 });
		}

		return NextResponse.json({
			success: true,
			message: `Profil ${jenis} berhasil dihapus`
		});
	} catch (error: any) {
		console.error('Error in DELETE /api/profil:', error);
		return NextResponse.json({ success: false, error: 'Internal server error' }, {
			status:
				500
		});
	}
}