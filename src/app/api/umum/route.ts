import { NextRequest, NextResponse } from 'next/server';
import { 
    getUmumKelurahan, 
    getUmumByJenis, 
    updateUmumByJenis,
    initializeUmumData
} from '@/libs/api/umum';
import { IUmum } from '@/types/umum';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const jenis = searchParams.get('jenis');

        if (jenis) {
            // Get specific umum by jenis
            const data = await getUmumByJenis(jenis as IUmum['jenis']);
            if (!data) {
                return NextResponse.json(
                    { success: false, error: 'Data umum tidak ditemukan' }, 
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, data });
        } else {
            // Get all umum data
            let data = await getUmumKelurahan();
            
            // Jika belum ada data, inisialisasi dengan data default
            if (!data || data.length === 0) {
                await initializeUmumData();
                data = await getUmumKelurahan();
            }
            
            return NextResponse.json({ success: true, data });
        }
    } catch (error) {
        console.error('Error in GET /api/umum:', error);
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

        // Update specific umum by jenis
        const success = await updateUmumByJenis(jenis as IUmum['jenis'], body);
        
        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Failed to update umum' }, 
                { status: 400 }
            );
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `Data umum ${jenis} berhasil diperbarui` 
        });
    } catch (error) {
        console.error('Error in PUT /api/umum:', error);
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
        const currentData = await getUmumKelurahan();
        if (!currentData) {
            return NextResponse.json(
                { success: false, error: 'No umum data found' }, 
                { status: 404 }
            );
        }

        // Filter out the item to delete
        const updatedData = currentData.filter(item => item.jenis !== jenis);
        
        // Update with filtered data
        for (const item of updatedData) {
            await updateUmumByJenis(item.jenis, item);
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `Data umum ${jenis} berhasil dihapus` 
        });
    } catch (error) {
        console.error('Error in DELETE /api/umum:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}