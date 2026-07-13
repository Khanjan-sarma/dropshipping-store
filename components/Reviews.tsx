import { StarRating } from "@/components/StarRating";

// Static social proof for v1 (DESIGN_GUIDE §8.7). Replace with real reviews later.
const REVIEWS = [
  {
    name: "Ananya R.",
    location: "Bengaluru",
    rating: 5,
    quote:
      "The neck fan is a lifesaver on my commute. Battery easily lasts my whole day out. Delivery was quick too.",
  },
  {
    name: "Rahul M.",
    location: "Pune",
    rating: 5,
    quote:
      "Ordered the mini cooler for my desk — genuinely keeps me cool while working. Paid on delivery, no hassle.",
  },
  {
    name: "Sneha K.",
    location: "Jaipur",
    rating: 4,
    quote:
      "Fridge organizer bins are sturdy and my fridge finally looks tidy. Good value for the price.",
  },
];

export function Reviews() {
  return (
    <div className="grid gap-4 md:grid-cols-3 md:gap-6">
      {REVIEWS.map((r) => (
        <figure
          key={r.name}
          className="flex flex-col rounded-md border border-hairline bg-white p-6"
        >
          <StarRating rating={r.rating} />
          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
            “{r.quote}”
          </blockquote>
          <figcaption className="mt-4 text-sm font-semibold text-foreground">
            {r.name}
            <span className="font-normal text-foreground-muted"> · {r.location}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
