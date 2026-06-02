type KioskMapProps = {
  address: string;
  status?: string;
  height?: number;
};

export default function KioskMap({ address, status, height = 420 }: KioskMapProps) {
  const cleanAddress = address?.trim() || "Universidad Tecnologica de Nuevo Laredo";
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(cleanAddress)}&output=embed`;

  return (
    <div className="kiosk-map-embed" style={{ minHeight: height }}>
      <iframe
        title={`Mapa Printia ${cleanAddress}`}
        src={mapUrl}
        width="100%"
        height={height}
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="kiosk-map-label">
        <div className="section-kicker">Punto Printia</div>
        <strong className="text-white d-block">{cleanAddress}</strong>
        {status && <span className="text-muted-custom small">{status}</span>}
      </div>
    </div>
  );
}
