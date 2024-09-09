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
          const newMap = new window.google.maps.Map(mapRef.current!, {
            center: results[0].geometry.location,
            zoom: 20,
            mapTypeId: "satellite"
          })
          setMap(newMap)
        }
      })
    }
  }, [step, address, map, isGoogleLoaded])

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setIsGoogleLoaded(true)}
      />
      <Card className="w-[350px]">
        {step === 1 ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <CardHeader>
                <CardTitle>Adresse eingeben</CardTitle>
                <CardDescription>Wie lautet die Adresse?</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Geben Sie Ihre Adresse ein" 
                          {...field} 
                          ref={autocompleteInputRef} // Move ref to the end
                        />
                      </FormControl>
                      <FormDescription>
                        Bitte geben Sie die vollständige Adresse ein.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">Weiter</Button>
              </CardFooter>
            </form>
          </Form>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Wir werden deine Solaranlage für dieses Dach planen</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={mapRef} className="h-[200px] w-full"></div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setStep(1);
                form.reset(); // Reset the form when going back
                setMap(null); // Reset the map when going back
              }}>Zurück</Button>
              <Button onClick={() => console.log("Weiter zum nächsten Schritt")}>Weiter</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </>
  )
}