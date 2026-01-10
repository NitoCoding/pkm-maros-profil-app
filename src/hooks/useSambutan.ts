import { useState, useEffect } from 'react';

interface ISambutan {
	judul: string;
	isi: string;
	gambar: string;
	namaLurah?: string;
	jabatanLurah?: string;
}

export function useSambutan() {
	const [sambutan, setSambutan] = useState<ISambutan | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSambutan = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch sambutan text from profil API
			const profilResponse = await fetch('/api/profil?jenis=sambutan');
			let profilData = null;

			try {
				const profilResult = await profilResponse.json();
				if (profilResponse.ok && profilResult.success && profilResult.data) {
					profilData = profilResult.data;
				}
			} catch (jsonError) {
				console.warn('Failed to parse profil response:', jsonError);
			}

			// Fetch lurah data from dashboard API
			const dashboardResponse = await fetch('/api/dashboard');
			let lurahData = null;

			try {
				const dashboardResult = await dashboardResponse.json();
				if (dashboardResponse.ok && dashboardResult.success && dashboardResult.data?.lurah) {
					lurahData = dashboardResult.data.lurah;
				}
			} catch (jsonError) {
				console.warn('Failed to parse dashboard response:', jsonError);
			}

			let sambutanData: ISambutan = {
				judul: 'Sambutan Lurah',
				isi: 'Selamat datang di website resmi Desa Benteng Gajah. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.',
				gambar: '',
				namaLurah: 'H. ALIMUDDIN, S.Sos.',
				jabatanLurah: 'Lurah'
			};

			// Process profil data (sambutan text)
			if (profilData) {
				sambutanData.judul = profilData.judul || 'Sambutan Lurah';
				// Pastikan isi adalah string valid
				sambutanData.isi = typeof profilData.isi === 'string'
					? profilData.isi
					: sambutanData.isi;
				sambutanData.gambar = profilData.gambar || '';
			}

			// Process dashboard data (lurah info)
			if (lurahData) {
				sambutanData.namaLurah = lurahData.name || 'H. ALIMUDDIN, S.Sos.';
				sambutanData.jabatanLurah = lurahData.position || 'Lurah';
				sambutanData.gambar = lurahData.photo || sambutanData.gambar;
			}

			setSambutan(sambutanData);
		} catch (err: any) {
			setError(err.message);
			console.error('Error fetching sambutan:', err);

			// Set fallback data on error
			setSambutan({
				judul: 'Sambutan Lurah',
				isi: 'Selamat datang di website resmi Desa Benteng Gajah. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.',
				gambar: '',
				namaLurah: 'H. ALIMUDDIN, S.Sos.',
				jabatanLurah: 'Lurah'
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSambutan();
	}, []);

	return {
		sambutan,
		loading,
		error,
		refresh: fetchSambutan,
	};
} 