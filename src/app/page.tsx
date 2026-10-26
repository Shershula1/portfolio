import { PortfolioHome } from "@/components/portfolio-home";

export default function HomePage() {
  return (
    <>
      <link rel="preload" as="image" href="/portrait.webp" fetchPriority="high" />
      <link rel="preload" as="image" href="/projects/room.webp" />
      <PortfolioHome />
    </>
  );
}
