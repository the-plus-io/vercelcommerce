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
    message: "Bitte geben Sie eine Adresse ein.",
  }),
})

export function SolarPlanningForm() {
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState("")
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const autocompleteInputRef = useRef<HTMLInputElement>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

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

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (place.formatted_address) {
          form.setValue("address", place.formatted_address)
        }
      })
    }
  }, [isGoogleLoaded, form, step])

  function onSubmit(values: z.infer<typeof formSchema>) {
    setAddress(values.address)
    setStep(2)
    setMap(null) // Reset the map when submitting a new address
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
                  <CardTitle className="text-2xl">Adresse eingeben</CardTitle>
                  <CardDescription className="text-lg mt-2">Wie lautet die Adresse?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Adresse</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Geben Sie Ihre Adresse ein" 
                            {...field} 
                            ref={autocompleteInputRef}
                            className="h-12 text-lg"
                          />
                        </FormControl>
                        <FormDescription className="text-base mt-2">
                          Bitte geben Sie die vollständige Adresse ein.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="h-12 px-6 text-lg">Weiter</Button>
                </CardFooter>
              </form>
            </Form>
          ) : (
            <div className="py-8">
              <CardHeader>
                <CardTitle className="text-2xl">Wir werden deine Solaranlage für dieses Dach planen</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Sie können den Marker verschieben, um den genauen Standort anzupassen.
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
                <Button onClick={() => console.log("Weiter zum nächsten Schritt")} className="h-12 px-6 text-lg">Weiter</Button>
              </CardFooter>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}