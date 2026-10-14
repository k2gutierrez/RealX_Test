import { useEffect, useState } from "react";
import { useRealEstate } from "../../context";

const STORAGE_KEY = "unlock-estate:profile";

const EditProfileTwo = () => {
  const { currentAccount, shortAddress } = useRealEstate();
  const [profile, setProfile] = useState({ displayName: "", bio: "", website: "" });
  const [saved, setSaved] = useState(false);
  useEffect(() => { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); if (value) setProfile((current) => ({ ...current, ...value })); } catch (_) {} }, []);
  const update = (field) => (event) => { setSaved(false); setProfile((current) => ({ ...current, [field]: event.target.value })); };
  const submit = (event) => { event.preventDefault(); localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); setSaved(true); };
  return <div className="ue-profile-layout"><aside><span className="ue-avatar xlarge">{currentAccount ? currentAccount.slice(2, 4).toUpperCase() : "UE"}</span><h2>{profile.displayName || "Marketplace creator"}</h2><p>{currentAccount ? shortAddress(currentAccount) : "No wallet connected"}</p><small>This profile is presentational. Property ownership always follows the connected wallet.</small></aside><form className="ue-support-form" onSubmit={submit}><label className="ue-field"><span>Display name</span><input value={profile.displayName} onChange={update("displayName")} maxLength={60} placeholder="Optional public label" /></label><label className="ue-field"><span>Short biography</span><textarea value={profile.bio} onChange={update("bio")} rows={5} maxLength={500} placeholder="Describe your property interests." /></label><label className="ue-field"><span>Website</span><input type="url" value={profile.website} onChange={update("website")} maxLength={200} placeholder="https://example.com" /></label><button className="ue-button primary" type="submit">Save in this browser</button>{saved && <p className="ue-form-success" role="status">Profile preferences saved locally.</p>}</form></div>;
};

export default EditProfileTwo;
