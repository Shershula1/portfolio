import { PortfolioHome } from "@/components/portfolio-home";
import { publicPath } from "@/lib/public-path";

export default function HomePage() {
  return (
    <>
      <link rel="preload" as="image" href={publicPath("/portrait.webp")} fetchPriority="high" />
      <link rel="preload" as="image" href={publicPath("/projects/room.webp")} />
      <PortfolioHome />
    </>
  );
}
