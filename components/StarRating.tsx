import { Star } from "lucide-react";

/**
 * Compact rating row: 5 lucide stars + numeric rating + muted count.
 * Filled stars use the near-black foreground token (amber is reserved for
 * savings/urgency per DESIGN_GUIDE §2), keeping the palette disciplined.
 */
export function StarRating({
  rating,
  count,
  className = "",
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className="flex items-center"
        role="img"
        aria-label={`Rated ${rating} out of 5`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < rounded
                ? "h-3.5 w-3.5 fill-foreground text-foreground"
                : "h-3.5 w-3.5 text-hairline"
            }
            aria-hidden
          />
        ))}
      </div>
      <span className="text-xs font-medium text-foreground">
        {rating.toFixed(1)}
      </span>
      {count != null && (
        <span className="text-xs text-foreground-muted">({count})</span>
      )}
    </div>
  );
}
