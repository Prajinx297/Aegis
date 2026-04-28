export interface ThreatSeed {
  raw_log: string;
  ip: string;
  timestamp: string;
  threat_type: string;
  severity: string;
  country: string;
  status: string;
  ai?: boolean;
}

const ips = [
  ["185.220.101.47", "Germany"],
  ["45.155.205.233", "Netherlands"],
  ["104.244.72.115", "United States"],
  ["91.240.118.172", "Russia"],
  ["103.231.91.88", "Singapore"],
  ["198.98.51.189", "United States"],
];

export const threatSeed: ThreatSeed[] = Array.from({ length: 30 }, (_, index) => {
  const [ip, country] = ips[index % ips.length];
  const paths = [
    "/wp-content/uploads/licensed-hero.jpg",
    "/api/assets/export?asset=full-resolution",
    "/cdn/originals/artist-pack.zip",
    "/login",
    "/media/watermarked-preview.png",
  ];
  const agents = ["python-requests/2.31", "Mozilla/5.0", "curl/8.4", "HeadlessChrome/121", "Masscan/1.3"];
  return {
    raw_log: `GET ${paths[index % paths.length]} HTTP/1.1 - ${ip} - ${agents[index % agents.length]} - bytes=${2048 + index * 91}`,
    ip,
    timestamp: new Date(Date.now() - index * 36e5).toISOString(),
    threat_type: index % 5 === 0 ? "UNAUTHORIZED_API" : index % 3 === 0 ? "IP_SCRAPER" : "CONTENT_BOT",
    severity: index % 5 === 0 ? "HIGH" : index % 4 === 0 ? "MEDIUM" : "LOW",
    country,
    status: index % 4 === 0 ? "BLOCKED" : "MONITORING",
  };
});
