import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Link } from "react-router";
import { allTrips } from "~/constants";

const TravelPage = () => {
  return (
    <div className="relative">
      <section className="travel-hero">
        <div>
          <section className="wrapper">
            <article>
              <p className="inline-flex items-center gap-2 w-fit rounded-full border border-light-100 bg-white/70 px-3 py-1 text-sm text-gray-700 shadow-100">
                <img src="/assets/icons/magic-star.svg" alt="" className="size-4" />
                AI-built itineraries. Human-level taste.
              </p>

              <h1 className="p-72-bold text-dark-100 tracking-tight">
                Design a trip you will actually love.
              </h1>

              <p>
                Tourvisto helps you go from vague idea to day by day plan in minutes: destinations, timing,
                budgets, and the little details that make a trip feel effortless.
              </p>
            </article>

          </section>
        </div>
      </section>

      <section id="how-it-works" className="wrapper pt-16 md:pt-24">
        <header className="header">
          <article>
            <h2 className="p-40-semibold text-dark-100">How it works</h2>
            <p className="text-gray-100">
              A clean flow from preferences to plan, without the spreadsheet energy.
            </p>
          </article>
        </header>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "/assets/icons/destination.svg",
              title: "Tell us the vibe",
              desc: "Budget, travel style, interests, and who you are traveling with.",
            },
            {
              icon: "/assets/icons/refresh.svg",
              title: "Get a draft plan",
              desc: "A day by day itinerary with timing, activities, and quick notes.",
            },
            {
              icon: "/assets/icons/calendar.svg",
              title: "Refine and go",
              desc: "Swap stops, change pace, and save a version that fits you.",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-20 border border-light-100 bg-white/70 p-6 shadow-100"
            >
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-primary-50 border border-light-100 flex-center">
                  <img src={s.icon} alt="icon" className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-dark-100">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm md:text-base text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="reviews" className="wrapper pt-16 md:pt-24 pb-16 md:pb-24">
        <header className="header">
          <article>
            <h2 className="p-40-semibold text-dark-100">Travelers say</h2>
            <p className="text-gray-100">Real people. Real plans. Zero tab chaos.</p>
          </article>
        </header>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              img: "/assets/images/james.webp",
              name: "James",
              quote:
                "The itinerary felt like it was written by someone who knows how time actually works on a trip.",
            },
            {
              img: "/assets/images/michael.webp",
              name: "Michael",
              quote:
                "We tweaked two days and everything still flowed. The pacing suggestions were on point.",
            },
            {
              img: "/assets/images/david.webp",
              name: "David",
              quote: "Best part: it handled the details and left us room for spontaneity.",
            },
          ].map((t) => (
            <figure
              key={t.name}
              className="rounded-20 border border-light-100 bg-white/70 p-6 shadow-100"
            >
              <blockquote className="text-sm md:text-base text-dark-400 leading-relaxed">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <img
                  src={t.img}
                  alt={t.name}
                  className="size-10 rounded-full aspect-square border border-light-100 bg-white"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark-100">{t.name}</p>
                  <p className="text-xs text-gray-500">Tourvisto traveler</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                  <img src="/assets/icons/star.svg" alt="" className="size-4" />
                  5.0
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

    </div>
  );
};

export default TravelPage;
