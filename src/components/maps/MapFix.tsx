// components/MapFix.tsx
'use client'

import {useEffect} from 'react'
import {useMap} from 'react-leaflet'

export default function MapFix() {
	const map = useMap()

	useEffect(() => {
		if (map) {
			// Delay sedikit untuk pastikan DOM stabil
			setTimeout(() => {
				map.invalidateSize()
			}, 700)
		}
	}, [map])

	return null
}
