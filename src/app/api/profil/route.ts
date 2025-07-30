import { NextRequest, NextResponse } from 'next/server';
import { 
	getProfilKelurahan, 
	updateProfilKelurahan, 
	getProfilByJenis, 
	updateProfilByJenis,
	initializeProfilData
} from '@/libs/api/profil';
import { IProfil } from '@/types/profil';

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const jenis = searchParams.get('jenis');

		if (jenis) {
			// Get specific profil by jenis
			const data = await getProfilByJenis(jenis as IProfil['jenis']);
			if (!data) {
				return NextResponse.json(
					{ success: false, error: 'Profil tidak ditemukan' }, 
					{ status: 404 }
				);
			}
			return NextResponse.json({ success: true, data });
		} else {
			// Get all profil data
			let data = await getProfilKelurahan();
			
			// Jika belum ada data, inisialisasi dengan data default
			if (!data || data.length === 0) {
				await initializeProfilData();
				data = await getProfilKelurahan();
			}
			
			return NextResponse.json({ success: true, data });
		}
	} catch (error) {
		console.error('Error in GET /api/profil:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' }, 
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		
		// Validate request body
		if (!body || !Array.isArray(body)) {
			return NextResponse.json(
				{ success: false, error: 'Invalid request body. Expected array of profil data.' }, 
				{ status: 400 }
			);
		}

		// Validate each profil item
		for (const item of body) {
			if (!item.jenis) {
				return NextResponse.json(
					{ success: false, error: 'Each profil item must have jenis' }, 
					{ status: 400 }
				);
			}
		}

		await updateProfilKelurahan(body);
		return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' });
	} catch (error) {
		console.error('Error in POST /api/profil:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' }, 
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const body = await req.json();
		const { searchParams } = new URL(req.url);
		const jenis = searchParams.get('jenis');

		if (!jenis) {
			return NextResponse.json(
				{ success: false, error: 'Jenis parameter is required' }, 
				{ status: 400 }
			);
		}

		// Validate request body
		if (!body || typeof body !== 'object') {
			return NextResponse.json(
				{ success: false, error: 'Invalid request body' }, 
				{ status: 400 }
			);
		}

		// Update specific profil by jenis
		await updateProfilByJenis(jenis as IProfil['jenis'], body);
		return NextResponse.json({ 
			success: true, 
			message: `Profil ${jenis} berhasil diperbarui` 
		});
	} catch (error) {
		console.error('Error in PUT /api/profil:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' }, 
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const jenis = searchParams.get('jenis');

		if (!jenis) {
			return NextResponse.json(
				{ success: false, error: 'Jenis parameter is required' }, 
				{ status: 400 }
			);
		}

		// Get current data
		const currentData = await getProfilKelurahan();
		if (!currentData) {
			return NextResponse.json(
				{ success: false, error: 'No profil data found' }, 
				{ status: 404 }
			);
		}

		// Filter out the item to delete
		const updatedData = currentData.filter(item => item.jenis !== jenis);
		
		// Update with filtered data
		await updateProfilKelurahan(updatedData);
		
		return NextResponse.json({ 
			success: true, 
			message: `Profil ${jenis} berhasil dihapus` 
		});
	} catch (error) {
		console.error('Error in DELETE /api/profil:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' }, 
			{ status: 500 }
		);
	}
}
