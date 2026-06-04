import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/components/page-hero";
import { SOCIAL_LINKS, CONTACT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Get in Touch | Her Game, Her Voice" },
      {
        name: "description",
        content:
          "Want to be a guest, nominate someone, sponsor the show, or invite us to an event? Get in touch with Her Game, Her Voice.",
      },
      { property: "og:title", content: "Get in Touch | Her Game, Her Voice" },
      {
        property: "og:description",
        content: "We’d love to hear from you — guests, sponsors, events and more.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const enquiryTypes = [
  "I want to be a guest",
  "I want to nominate someone as a guest",
  "Sponsorship enquiry",
  "Event invitation",
  "General enquiry",
] as const;

const formSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  enquiryType: z.enum(enquiryTypes, { message: "Please choose an enquiry type" }),
  message: z.string().trim().min(10, "Please write a little more (10+ characters)").max(2000),
});

type FormValues = z.infer<typeof formSchema>;

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined;

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    // If a Formspree endpoint is configured, submit to it. Otherwise fall back
    // to a prefilled mailto so the site is fully functional without a key.
    if (FORMSPREE_ENDPOINT) {
      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            "Enquiry Type": values.enquiryType,
            message: values.message,
            _subject: `New ${values.enquiryType} — Her Game, Her Voice`,
          }),
        });
        if (!res.ok) throw new Error("Request failed");
        setSubmitted(true);
        form.reset();
      } catch {
        toast.error("Something went wrong sending your message. Please try again or email us directly.");
      }
      return;
    }

    // Fallback: open the user's email client prefilled.
    const body = encodeURIComponent(
      `Name: ${values.name}\nEmail: ${values.email}\nEnquiry: ${values.enquiryType}\n\n${values.message}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `${values.enquiryType} — Her Game, Her Voice`,
    )}&body=${body}`;
    setSubmitted(true);
    form.reset();
  };

  return (
    <>
      <PageHero title="Get in Touch" subtitle="We’d love to hear from you" />

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-center rounded-2xl bg-secondary/30 p-10 text-center">
                <CheckCircle2 className="size-12 text-accent" aria-hidden="true" />
                <h2 className="mt-4 font-display text-2xl font-bold text-primary">
                  Thanks for reaching out!
                </h2>
                <p className="mt-2 text-muted-foreground">We’ll get back to you soon.</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" autoComplete="name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@email.com"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enquiryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enquiry Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an enquiry type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {enquiryTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea rows={5} placeholder="Tell us more…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    variant="coral"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              </Form>
            )}
          </div>

          {/* Info */}
          <aside className="rounded-2xl bg-navy-gradient p-8 text-white">
            <h2 className="font-display text-2xl font-bold">Other ways to reach us</h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-5 inline-flex items-center gap-2 text-secondary hover:text-white transition-colors"
            >
              <Mail className="size-5" />
              {CONTACT_EMAIL}
            </a>

            <p className="mt-8 text-sm text-white/70">
              Follow us for behind-the-scenes content and episode announcements.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
