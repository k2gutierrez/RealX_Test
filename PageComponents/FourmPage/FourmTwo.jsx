const FourmTwo = ({ topics = [] }) => <div className="ue-forum-stats"><div><strong>{topics.length}</strong><span>Topics</span></div><div><strong>{topics.reduce((sum, topic) => sum + Number(topic.replies || 0), 0)}</strong><span>Replies</span></div><div><strong>Local demo</strong><span>Storage mode</span></div></div>;

export default FourmTwo;
