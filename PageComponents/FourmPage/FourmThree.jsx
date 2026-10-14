const FourmThree = ({ topics = [] }) => <div className="ue-forum-list">{topics.map((topic) => <article key={topic.id}><span className="ue-avatar">{topic.author.slice(0, 2).toUpperCase()}</span><div><small>{topic.category}</small><h2>{topic.title}</h2><p>Started by {topic.author}</p></div><strong>{topic.replies}<small> replies</small></strong></article>)}</div>;

export default FourmThree;
