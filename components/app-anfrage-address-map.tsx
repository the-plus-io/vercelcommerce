'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'

// Replace with your actual API key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

async function checkAddress(prevState: any, formData: FormData) {
  const address = formData.get('address') as string
  return { address }
}

export function AddressMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [state, formAction] = useFormState(checkAddress, null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mapLoaded && state?.address && !map && mapRef.current) {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address: state.address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const newMap = new google.maps.Map(mapRef.current!, {
            center: results[0].geometry.location,
            zoom: 20,
            mapTypeId: 'satellite'
          })
          setMap(newMap)
          setError(null)
        } else {
          setError('Adresse konnte nicht gefunden werden. Bitte überprüfen Sie Ihre Eingabe.')
        }
      })
    }
  }, [mapLoaded, state, map])

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setMapLoaded(true)}
      />
      <div 
        ref={mapRef} 
        className={`w-full h-64 rounded-lg overflow-hidden shadow-md ${!map ? 'bg-gray-200' : ''}`}
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </>
  )
}