import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { CONTACT_EMAIL, ISSUES_URL } from '../config/site';
import { useSeo } from '../lib/useSeo';

const contact = CONTACT_EMAIL
  ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  : <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">the project issue tracker</a>;

export function Creators() {
  useSeo('For creators', 'How to submit music, films and documentaries to NaijaFreeDownload, and what licence information is required.');
  return (
    <>
      <PageHeader title="For creators">Share your work with a licence that lets people download it legally.</PageHeader>
      <section className="panel prose">
        <h2>Submission requirements</h2>
        <ul>
          <li>You own the work or hold written permission from the rights holder.</li>
          <li>The work is public domain, or carries a named licence (for example Creative Commons) with a link to its terms.</li>
          <li>The download is served over HTTPS from a source you control or a recognised archive.</li>
          <li>You provide title, description, category, release date, file format, file size and cover art.</li>
        </ul>
        <h2>How to submit</h2>
        <p>Send the release details and proof of rights through {contact}. Each submission is reviewed before it is added to the catalogue.</p>
        <h2>Catalogue entry format</h2>
        <p>Approved releases are added to <code>public/data/releases.json</code>. The field list is documented in the project README.</p>
      </section>
    </>
  );
}

export function About() {
  useSeo('About', 'About NaijaFreeDownload, a catalogue of legally available music, Nollywood films and documentaries.');
  return (
    <>
      <PageHeader title="About">A catalogue of music and films you are allowed to download.</PageHeader>
      <section className="panel prose">
        <p>NaijaFreeDownload helps people find Nigerian and African music, Nollywood films, independent releases and documentaries that are legally free to download. Every entry shows its licence and source.</p>
        <p>The site does not host copyrighted media without permission and does not link to unauthorised copies. Creators who want to publish can read <Link to="/creators">the submission requirements</Link>.</p>
      </section>
    </>
  );
}

export function Copyright() {
  useSeo('Copyright and takedown', 'Copyright policy and how to request removal of a release from NaijaFreeDownload.');
  return (
    <>
      <PageHeader title="Copyright and takedown">How we handle rights and removal requests.</PageHeader>
      <section className="panel prose">
        <h2>Our policy</h2>
        <p>Only public-domain, creator-authorised or properly licensed works are listed. Licence names and links are shown on every release so you can check the terms yourself.</p>
        <h2>Request a takedown</h2>
        <p>If you hold the rights to a listed work and did not authorise it, contact us through {contact} with:</p>
        <ul>
          <li>The title and page address of the release.</li>
          <li>Your name and contact details.</li>
          <li>A statement that you are the rights holder or their authorised agent.</li>
          <li>Evidence of ownership.</li>
        </ul>
        <p>Valid requests are acted on promptly, and the release is removed from the catalogue while the claim is reviewed. This page is general information and not legal advice.</p>
      </section>
    </>
  );
}

export function NotFound() {
  useSeo('Page not found', 'The page you requested does not exist.');
  return (
    <>
      <PageHeader title="Page not found">This address does not match any page on NaijaFreeDownload.</PageHeader>
      <Link className="btn" to="/">Go to Overview</Link>
    </>
  );
}
