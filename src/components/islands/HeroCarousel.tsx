import { useEffect, useState, useCallback, useRef } from 'preact/hooks';

interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  zone: string;
  description: string;
  phone: string;
  photos?: string[];
  tags?: string[];
  verified: boolean;
  destacado: boolean;
}

interface Props {
  businesses: Business[];
}

export default function HeroCarousel({ businesses }: Props) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = businesses.length;
  const hasMultiple = total > 1;

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + total) % total);
    },
    [total],
  );

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-rotate every 5s
  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasMultiple, isPaused, next]);

  if (total === 0) return null;

  const b = businesses[current];
  const bgPhoto = b.photos?.[0] ?? null;

  return (
    <div
      class="relative h-[400px] rounded-2xl overflow-hidden coastal-shadow group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background */}
      {bgPhoto ? (
        <img
          src={bgPhoto}
          alt={b.name}
          class="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div class="absolute inset-0 bg-gradient-to-br from-primary to-primary-container" />
      )}

      {/* Hero Gradient overlay */}
      <div class="absolute inset-0 hero-gradient flex flex-col justify-center px-8 lg:px-12 text-white">
        <span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm font-bold w-fit mb-4">
          Servicio Destacado
        </span>
        <h1 class="font-headline text-headline-lg lg:text-headline-xl text-white mb-2">
          {b.name}
        </h1>
        <p class="font-sans text-body-lg text-white/90 max-w-md mb-8 line-clamp-2">
          {b.description}
        </p>
        <a
          href={`/negocio/${b.slug}`}
          class="bg-accent hover:brightness-110 text-white font-bold py-3 px-8 rounded-lg transition-all inline-flex items-center gap-2 w-fit"
        >
          Ver perfil
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Navigation Arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={prev}
            class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Anterior"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={next}
            class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Siguiente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {hasMultiple && (
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {businesses.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              class={`h-1 rounded-full transition-all ${
                i === current ? 'w-8 bg-white' : 'w-8 bg-white/40'
              }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
