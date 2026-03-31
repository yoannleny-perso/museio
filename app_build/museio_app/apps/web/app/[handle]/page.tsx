import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card } from "@museio/ui";
import { fetchPublicPortfolioOnServer } from "../../src/lib/server-api";
import { getWebEnv } from "../../src/lib/env";
import { PublicPortfolio } from "../../src/portfolio/public-portfolio";

interface HandlePageProps {
  params: Promise<{
    handle: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: HandlePageProps): Promise<Metadata> {
  const { handle } = await params;
  const canonicalUrl = `${getWebEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/${handle}`;

  return {
    title: `${handle} | Museio`,
    description: "Museio public portfolio",
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: `${handle} | Museio`,
      description: "Museio public portfolio",
      url: canonicalUrl,
      type: "profile"
    }
  };
}

export default async function PublicPortfolioPage({ params }: HandlePageProps) {
  const { handle } = await params;
  const response = await fetchPublicPortfolioOnServer(handle);

  if (!response.state) {
    if (response.status === 404) {
      notFound();
    }

    const title =
      response.status === 403 ? "This portfolio is private" : "Portfolio not found";
    const description =
      response.status === 403
        ? "The creator has turned off public visibility for this page."
        : "The handle does not resolve to a live public portfolio.";

    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background:
            "radial-gradient(circle at top, rgba(109, 69, 227, 0.16), transparent 42%), #f5f6fb"
        }}
      >
        <Card style={{ width: "min(100%, 560px)" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <Badge tone="warning">Live mode unavailable</Badge>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>{title}</h1>
            <p style={{ margin: 0, lineHeight: 1.8, color: "#5D6575" }}>
              {description}
            </p>
            <div>
              <Link href="/" style={{ textDecoration: "none" }}>
                <Button variant="secondary">Return to Museio</Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  return <PublicPortfolio state={response.state} />;
}
