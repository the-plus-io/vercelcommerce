"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import Script from 'next/script'
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  address: z.string().min(1, {
    message: "Bitte geben Sie eine gültige Adresse ein.",
  }),
})

export function SolarPlanningForm() {
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState("")
  const [addressError, setAddressError] = useState("")
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const autocompleteInputRef = useRef<HTMLInputElement>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisImages = [
    '/images/roof-outline.png',
    '/images/roof-measurement.png',
    '/images/roof-sun-exposure.png',
    '/images/roof-panel-placement.png',
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  })

  useEffect(() => {
    if (isGoogleLoaded && autocompleteInputRef.current && step === 1) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: "de" },
        fields: ["formatted_address", "geometry"]
      })

      const updateAddressAndAdvance = () => {
        const place = autocomplete.getPlace()
        if (place.formatted_address) {
          form.setValue("address", place.formatted_address)
          setAddress(place.formatted_address)
          setAddressError("")
          setStep(2)
          setMap(null)
        } else {
          setAddressError("Bitte wählen Sie eine gültige Adresse aus den Vorschlägen.")
        }
      }

      autocomplete.addListener("place_changed", updateAddressAndAdvance)

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          updateAddressAndAdvance()
        }
      }

      autocompleteInputRef.current.addEventListener('keydown', handleKeyDown)

      return () => {
        window.google.maps.event.clearInstanceListeners(autocomplete)
        autocompleteInputRef.current?.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isGoogleLoaded, form, step, setAddress])

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!address) {
      setAddressError("Bitte geben Sie eine gültige Adresse ein.")
      return
    }
    setStep(2)
  }

  useEffect(() => {
    if (step === 2 && mapRef.current && !map && isGoogleLoaded) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location
          const newMap = new window.google.maps.Map(mapRef.current!, {
            center: location,
            zoom: 20,
            mapTypeId: "satellite"
          })
          
          // Add a draggable marker at the geocoded location
          const newMarker = new window.google.maps.Marker({
            position: location,
            map: newMap,
            title: "Selected Address",
            draggable: true
          })

          // Update address when marker is dragged
          newMarker.addListener('dragend', () => {
            const newPosition = newMarker.getPosition()
            if (newPosition) {
              geocoder.geocode({ location: newPosition }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                  setAddress(results[0].formatted_address)
                  form.setValue("address", results[0].formatted_address)
                }
              })
            }
          })

          setMap(newMap)
          setMarker(newMarker)
        }
      })
    }
  }, [step, address, map, isGoogleLoaded, form])

  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setAnalysisStep((prev) => (prev + 1) % analysisImages.length);
      }, 1000);

      const timer = setTimeout(() => {
        clearInterval(interval);
        setStep(4);
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [step]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setIsGoogleLoaded(true)}
      />
      <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <Card className="bg-white dark:bg-neutral-900">
          {step === 1 ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-8">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Entdecken Sie Ihr Solarpotenzial</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Senken Sie Ihre Energiekosten und schützen Sie die Umwelt mit Solarenergie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Ihre Adresse</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Geben Sie Ihre vollständige Adresse ein" 
                            {...field} 
                            ref={autocompleteInputRef}
                            className="h-12 text-lg"
                          />
                        </FormControl>
                        <FormDescription className="text-base mt-2">
                          In nur wenigen Minuten erhalten Sie Ihren persönlichen Solarplan
                        </FormDescription>
                        {addressError && <FormMessage>{addressError}</FormMessage>}
                      </FormItem>
                    )}
                  />
                  <div className="text-sm text-gray-600">
                    Schließen Sie sich über 10.000 zufriedenen Solarkunden in Deutschland an
                  </div>
                  <ul className="text-sm list-none">
                    <li>✓ Keine Vorabkosten</li>
                    <li>✓ Professionelle Installation</li>
                    <li>✓ 25 Jahre Leistungsgarantie</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-600">
                    Zeitlich begrenztes Angebot: 10% Rabatt auf die Installation bei Buchung innerhalb von 7 Tagen nach Ihrer Bewertung
                  </p>
                  <Button type="submit" className="w-full">Mein Solarpotenzial berechnen</Button>
                </CardFooter>
              </form>
            </Form>
          ) : step === 2 ? (
            <div className="py-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {address ? `Ausgezeichnete Wahl, ${address}!` : 'Ihr Solarpotenzial'}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Lassen Sie uns Ihr Dach genauer betrachten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={mapRef} className="h-[400px] w-full"></div>
                <p className="mt-4 text-lg">Aktuelle Adresse: {address}</p>
              </CardContent>
              <CardFooter className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => {
                  setStep(1);
                  form.reset();
                  setMap(null);
                  setMarker(null);
                }} className="h-12 px-6 text-lg">Zurück</Button>
                <Button onClick={() => setStep(3)} className="h-12 px-6 text-lg">Mein Solarpotenzial berechnen</Button>
              </CardFooter>
            </div>
          ) : step === 3 ? (
            <div className="py-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Wir analysieren Ihr Dach</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Gleich erfahren Sie, wie viel Sie sparen können
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                <div className="relative w-48 h-48">
                  {/* Roof */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[60px] border-l-transparent border-r-transparent border-b-amber-900"></div>
                  {/* Sun */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </div>
          ) : (
            <div className="py-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Ihr persönlicher Solarplan ist bereit</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Entdecken Sie Ihr Einsparpotenzial und den Beitrag zum Umweltschutz
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Hier können Sie die Ergebnisse der Analyse anzeigen */}
              </CardContent>
              <CardFooter className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => {
                  setStep(1);
                  form.reset();
                  setMap(null);
                  setMarker(null);
                }} className="h-12 px-6 text-lg">Neue Berechnung</Button>
                <Button onClick={() => console.log("Weiter zum nächsten Schritt")} className="h-12 px-6 text-lg">Jetzt Beratungstermin vereinbaren</Button>
              </CardFooter>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}