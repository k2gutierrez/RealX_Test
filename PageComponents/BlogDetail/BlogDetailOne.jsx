const BlogDetailOne = ({ article }) => <header className="ue-article-header"><span>{article.category} / {article.date}</span><h1>{article.title}</h1><p>{article.excerpt}</p></header>;

export default BlogDetailOne;
