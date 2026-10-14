import Link from "next/link";
import { ARTICLES } from "../../data/content";

const BlogTwo = ({ limit }) => <div className="ue-article-grid">{ARTICLES.slice(0, limit || ARTICLES.length).map((article) => <article className="ue-article-card" key={article.slug}><Link href={`/blogdetail?slug=${article.slug}`} className="ue-article-image"><img src={article.image} alt="" /></Link><div><span>{article.category} / {article.date}</span><h2><Link href={`/blogdetail?slug=${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p><Link href={`/blogdetail?slug=${article.slug}`} className="ue-text-link">Read article</Link></div></article>)}</div>;

export default BlogTwo;
