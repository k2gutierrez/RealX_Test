import Link from "next/link";

const BlogDetailTwo = ({ article }) => <article className="ue-article-detail"><img src={article.image} alt="" />{article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<aside><strong>Important</strong><p>This project is an educational DApp. Marketplace records do not replace legal title, valuation or due-diligence processes.</p></aside><Link href="/blog" className="ue-button ghost">Back to journal</Link></article>;

export default BlogDetailTwo;
