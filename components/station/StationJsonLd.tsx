interface StationJsonLdProps {
  station: {
    id: string;
    name: string | null;
    address: string;
    city: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
}

export function StationJsonLd({ station }: StationJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GasStation",
    name: station.name ?? `Station ${station.city}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: station.address,
      addressLocality: station.city,
      postalCode: station.postalCode,
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: station.latitude,
      longitude: station.longitude,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
