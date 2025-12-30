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
			const profilResult = await profilResponse.json();

			// Fetch lurah data from dashboard API
			const dashboardResponse = await fetch('/api/dashboard');
			const dashboardResult = await dashboardResponse.json();

			let sambutanData: ISambutan = {
				judul: 'Sambutan Lurah',
				isi: 'Selamat datang di website resmi Desa Benteng Gajah. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat dengan mengutamakan transparansi, akuntabilitas, dan partisipasi aktif dari seluruh warga.',
				gambar: '',
				namaLurah: 'H. ALIMUDDIN, S.Sos.',
				jabatanLurah: 'Lurah'
			};

			// Process profil data (sambutan text)
			if (profilResponse.ok && profilResult.success && profilResult.data) {
				const profilSambutan = profilResult.data;
                // // console.log('profilSambutan',profilSambutan);
				sambutanData.judul = profilSambutan.judul || 'Sambutan Lurah';
				sambutanData.isi = profilSambutan.isi || sambutanData.isi;
				sambutanData.gambar = profilSambutan.gambar || '';
			}
            // // console.log(profilResult);
            // // console.log(sambutanData);

			// Process dashboard data (lurah info)
			if (dashboardResponse.ok && dashboardResult.success && dashboardResult.data?.lurah) {
				const lurahData = dashboardResult.data.lurah;
                // // console.log('lurahData',lurahData);
				sambutanData.namaLurah = lurahData.name || 'H. ALIMUDDIN, S.Sos.';
				sambutanData.jabatanLurah = lurahData.position || 'Lurah';
                sambutanData.gambar = lurahData.photo || '';
			}
            // // console.log('dashboardResult',dashboardResult);
            // // console.log(sambutanData);

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