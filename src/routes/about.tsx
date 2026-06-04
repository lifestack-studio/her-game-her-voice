import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Users, ShieldCheck } from "lucide-react";
import emmaHeadshot from "@/assets/emma-headshot.png";
import studioBranding from "@/assets/studio-branding.jpg";
import recordingJersey from "@/assets/recording-jersey.jpg";
import pinkStudio from "@/assets/pink-studio.jpg";
import seasonTwo from "@/assets/season-two.jpg";
import studioMic from "@/assets/studio-mic.jpg";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { PhotoGallery } from "@/components/photo-gallery";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Her Game, Her Voice" },
      {
        name: "description",
        content:
          "The story behind the mic. Meet Emma Stigter, founder and host of Her Game, Her Voice — a podcast giving women in ice hockey a voice.",
      },
      { property: "og:title", content: "About | Her Game, Her Voice" },
      {
        property: "og:description",
        content: "The story behind the mic — meet founder and host Emma Stigter.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const pillars = [
  {
    Icon: Mic,
    title: "Amplify Voices",
    text: "Give women in hockey a platform to share their stories.",
  },
  {
    Icon: Users,
    title: "Build Community",
    text: "Connect players, fans, coaches, and supporters.",
  },
  {
    Icon: ShieldCheck,
    title: "Break Barriers",
    text: "Challenge the ‘girls can’t play’ narrative.",
  },
];

const galleryPhotos = [
  {
    src: studioBranding.url,
    alt: "Emma Stigter recording in front of the Her Game, Her Voice branded studio wall",
    tall: true,
  },
  { src: recordingJersey.url, alt: "Emma in a Stars jersey wearing headphones during a recording" },
  
  { src: pinkStudio.url, alt: "Emma celebrating outside the pink Her Game, Her Voice podcast studio" },
  {
    src: studioMic.url,
    alt: "Behind the scenes at the Her Game, Her Voice studio with a RODE microphone",
    tall: true,
  },
  { src: seasonTwo.url, alt: "Emma warming up for season two of the podcast" },
];

function AboutPage() {
  return (
    <>
      <PageHero title="About" subtitle="The story behind the mic" />

      {/* Host bio */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 sm:px-6 md:grid-cols-[320px_1fr]">
          <div className="mx-auto md:sticky md:top-24">
            <div className="relative">
              <div className="aspect-square w-64 overflow-hidden rounded-full border-[6px] border-secondary shadow-card md:w-80">
                <img
                  src={emmaHeadshot.url}
                  alt="Emma Stigter, founder and host of Her Game, Her Voice"
                  width={800}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Emma Stigter
            </h2>
            <p className="mt-1 font-display text-lg font-semibold text-accent">Founder &amp; Host</p>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-foreground">
              <p>
                Her Game, Her Voice is a podcast about women changing the face of ice hockey,
                one story at a time.
              </p>
              <p>
                Hosted by Emma Stigter, each episode features in-person conversations with team
                captains and key players from across the UK. We talk about what it really means
                to lead, to belong, and to build something bigger than just a team.
              </p>
              <p>
                The podcast started as an opportunity to give women a voice in the sport. Our
                founder Emma Stigter got sick of being told “Girls can’t play hockey” and
                wanted to prove otherwise.
              </p>
              <p>
                After studying Radio and Audio at the University of Bedfordshire, Emma saw a gap
                in the podcast market for content focused on women’s ice hockey in Europe. Thus
                creating Her Game, Her Voice.
              </p>
              <p>
                We are more than just a podcast — we want to work within the hockey community and
                break down barriers women face in the sport. If you have an event you want us to
                attend, please get in touch!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Behind the scenes gallery */}
      <section className="bg-background py-20 sm:py-24">

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Behind the Mic
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              From the rink to the studio — moments from the journey so far.
            </p>
          </div>
          <PhotoGallery photos={galleryPhotos} className="mt-12" />
        </div>
      </section>



      {/* Mission pillars */}
      <section className="bg-secondary/20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-primary sm:text-4xl">
            What we stand for
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pillars.map(({ Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl bg-secondary p-8 text-primary shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-secondary">
                  <Icon className="size-7" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-primary/80">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-gradient">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Want to be part of the story?
          </h2>
          <Button asChild variant="onDark" size="lg">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
