import { useState } from "react";

const ContactThree = () => {
  const [sent, setSent] = useState(false);
  const submit = (event) => { event.preventDefault(); setSent(true); event.currentTarget.reset(); };
  return <form className="ue-support-form" onSubmit={submit}><div className="ue-field-grid two"><label className="ue-field"><span>Name</span><input name="name" maxLength={80} required /></label><label className="ue-field"><span>Email</span><input name="email" type="email" maxLength={160} required /></label></div><label className="ue-field"><span>Topic</span><select name="topic"><option>Marketplace question</option><option>Technical issue</option><option>Security report</option><option>General feedback</option></select></label><label className="ue-field"><span>Message</span><textarea name="message" rows={7} maxLength={2500} required /></label><button className="ue-button primary" type="submit">Prepare message</button>{sent && <p className="ue-form-success" role="status">Your message has been prepared locally. Connect this form to an approved mail service before public deployment.</p>}</form>;
};

export default ContactThree;
