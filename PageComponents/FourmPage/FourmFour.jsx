import { useState } from "react";

const FourmFour = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onAdd({ title: data.get("title"), category: data.get("category") });
    event.currentTarget.reset();
    setOpen(false);
  };
  if (!open) return <button type="button" className="ue-button primary" onClick={() => setOpen(true)}>Start a topic</button>;
  return <form className="ue-forum-form" onSubmit={submit}><label className="ue-field"><span>Topic title</span><input name="title" maxLength={140} required /></label><label className="ue-field"><span>Category</span><select name="category"><option>Property discussion</option><option>Due diligence</option><option>Development</option><option>IPFS</option></select></label><div className="ue-inline-actions"><button className="ue-button primary" type="submit">Publish locally</button><button className="ue-button ghost" type="button" onClick={() => setOpen(false)}>Cancel</button></div></form>;
};

export default FourmFour;
