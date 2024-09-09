import { Button } from "@/components/ui/button"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Form from 'next/form'

async function submitForm(formData: FormData) {
  // Here you would typically process the form data
  // For now, we'll just log it
  console.log(Object.fromEntries(formData))
  
  // You could redirect or revalidate the page here
  // For example:
  // revalidatePath('/anfrage')
}

export default function AnfragePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Anfrage</h1>
      <Form action={submitForm} className="space-y-8">
        <FormField
          name="name"
          render={() => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input name="name" placeholder="John Doe" required minLength={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="email"
          render={() => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input name="email" type="email" placeholder="john@example.com" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="subject"
          render={() => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select name="subject" required>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="message"
          render={() => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  name="message"
                  placeholder="Type your message here."
                  className="resize-none"
                  required
                  minLength={10}
                />
              </FormControl>
              <FormDescription>
                Please provide as much detail as possible.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  )
}