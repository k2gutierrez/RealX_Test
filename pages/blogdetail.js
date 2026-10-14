import { useRouter } from "next/router";
import { BlogDetailOne, BlogDetailTwo } from "../PageComponents/BlogDetail";
import { Layout } from "../PageComponents/Components";
import { ARTICLES } from "../data/content";

export default function BlogDetailPage() {
  const { query } = useRouter();
  const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug;
  const article = ARTICLES.find((item) => item.slug === slug) || ARTICLES[0];
  return <Layout title={`${article.title} | Kevintrolix RealX`}><section className="ue-section soft"><div className="ue-container narrow"><BlogDetailOne article={article} /></div></section><section className="ue-section"><div className="ue-container narrow"><BlogDetailTwo article={article} /></div></section></Layout>;
}
