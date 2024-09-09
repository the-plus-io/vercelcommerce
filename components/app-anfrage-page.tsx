'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Form from 'next/form'
import { Suspense } from 'react'
import { AddressMap } from './app-anfrage-address-map'

export function AppAnfragePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-[#00326e] text-white p-6">
          <CardTitle className="text-2xl font-bold text-center">
            Solaranlage Anfrage
          </CardTitle>
        </CardHeader>
        <Form action="/submit-address">
          <CardContent className="space-y-6 p-6">
            <div>
              <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-2">
                Ihre Adresse
              </label>
              <Input
                id="address-input"
                name="address"
                type="text"
                placeholder="Geben Sie Ihre Adresse ein"
                required
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#f39200] focus:border-[#f39200]"
              />
            </div>
            <Suspense fallback={<div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />}>
              <AddressMap />
            </Suspense>
          </CardContent>
          <CardFooter className="flex justify-center p-6 bg-gray-50">
            <Button 
              type="submit"
              className="bg-[#f39200] hover:bg-[#e08600] text-white font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#f39200] focus:ring-opacity-50"
            >
              Adresse überprüfen
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  )
}