import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { CONTACT_EMAIL } from '../config/site';
import { usePageSeo, useSeo } from '../lib/useSeo';
import { RIGHTS_BASES, RIGHTS_BASIS_LABELS } from '../lib/verification';

const UPDATED = '21 November 2026';
const mail = (subject: string) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
const email = <a href={mail('NaijaFreeDownload enquiry')}>{CONTACT_EMAIL}</a>;

export function About() {
  usePageSeo();
  return (
    <>
      <PageHeader title="About">NaijaFreeDownload is a worldwide guide to music, movies, anime and documentaries, with a strict rule about downloads.</PageHeader>
      <section className="panel prose">
        <h2>What this site is</h2>
        <p>NaijaFreeDownload helps people find and learn about music, films, anime and documentaries from every country and language. Each title page brings together publicly available information (for example cast, artists, genres, release dates and synopses) and points to official places to listen or watch.</p>
        <h2>Where the information comes from</h2>
        <ul>
          <li><strong>Movies, TV and people:</strong> metadata and artwork from The Movie Database (TMDB). This product uses the TMDB API but is not endorsed or certified by TMDB.</li>
          <li><strong>Music:</strong> charts, artist, album and track details and 30-second previews from Apple’s public music catalogue.</li>
          <li><strong>Anime:</strong> series and character information from AniList.</li>
          <li><strong>Short descriptions:</strong> the “About” summaries on title pages are assembled only from those sources’ listed facts. We do not add invented background, reviews or ratings.</li>
        </ul>
        <h2>How downloads work</h2>
        <p>Most titles on this site are information only. A download is offered only when the work is public domain, properly licensed, an official artist or label download, or provided through a verified authorised distributor, and only after a reviewer has checked the rights and the source. We do not host media files, and we do not assume that a third-party link is authorised. See the <Link to="/copyright">copyright and takedown policy</Link> for the exact rules.</p>
        <h2>Who runs it</h2>
        <p>NaijaFreeDownload is an independent project. You can reach us at {email} or through the <Link to="/contact">contact page</Link>.</p>
        <h2>Advertising</h2>
        <p>The site may show advertising in future to cover running costs. Ads are never shown until we have set them up and you have chosen to allow advertising cookies, and they are always labelled. See the <Link to="/privacy">Privacy Policy</Link>.</p>
      </section>
    </>
  );
}

export function Contact() {
  usePageSeo();
  return (
    <>
      <PageHeader title="Contact us">Questions, corrections, creator submissions, privacy requests or a copyright concern: write to us.</PageHeader>
      <section className="panel prose">
        <h2>Email</h2>
        <p>Our only contact channel is email: {email}. We read every message, but we do not promise a response time.</p>
        <p><a className="btn" href={mail('NaijaFreeDownload enquiry')}>Email NaijaFreeDownload</a></p>
        <h2>What to include</h2>
        <ul>
          <li><strong>Correction:</strong> the page address and what is wrong or missing.</li>
          <li><strong>Creator submission:</strong> see the <Link to="/creators">requirements for creators</Link>.</li>
          <li><strong>Copyright concern:</strong> use the steps on the <Link to="/copyright">copyright and takedown page</Link>.</li>
          <li><strong>Privacy request:</strong> say what you would like us to do. See the <Link to="/privacy">Privacy Policy</Link>.</li>
        </ul>
        <p>Please do not send passwords, payment details or other sensitive information by email.</p>
      </section>
    </>
  );
}

export function Creators() {
  usePageSeo();
  return (
    <>
      <PageHeader title="For creators">Share your work under terms that let people download it legally, and show us the evidence.</PageHeader>
      <section className="panel prose">
        <h2>What we can list for download</h2>
        <ul>{RIGHTS_BASES.map((b) => <li key={b}>{RIGHTS_BASIS_LABELS[b]}</li>)}</ul>
        <h2>What every submission needs</h2>
        <ul>
          <li>Title, category, and the artist, creator or distributor.</li>
          <li>The original source of the work and the official page for it (https).</li>
          <li>Your licence or distribution permission, with a link to its terms.</li>
          <li>The https download address. If it is on a different website than the official page, a link to the rights holder’s written statement authorising that host.</li>
          <li>Release date, file format, file size and, if you have it, cover art.</li>
        </ul>
        <h2>How review works</h2>
        <p>Send the details to {email}. A reviewer checks the source and the rights evidence by hand. Items that cannot be verified are rejected or held back, and nothing is published automatically. Approved items are shown with their licence, source and the date they were reviewed.</p>
      </section>
    </>
  );
}

export function Copyright() {
  usePageSeo();
  return (
    <>
      <PageHeader title="Copyright and takedown">How we decide what may be offered for download, and how to report a problem.</PageHeader>
      <section className="panel prose">
        <p><strong>Last updated: {UPDATED}</strong></p>
        <h2>Our verification rules</h2>
        <p>An item can be offered for download only if all of the following are recorded and approved:</p>
        <ul>
          <li>title and category; artist, creator or distributor;</li>
          <li>the original content source and the official page for the work;</li>
          <li>the legal basis: public domain, licensed work, official artist or label download, or verified authorised distributor;</li>
          <li>a verified source and a reviewer’s approval, with the reviewer’s name and date.</li>
        </ul>
        <p>If a file is on a different website than the official source, we also require evidence from the rights holder that the host is authorised. We never copy or scrape downloads, and we never assume that a third-party link is authorised. Anything unverified is rejected or quarantined and is not shown. Most pages are information only, with links to official listening and viewing pages.</p>
        <h2>Report a listing you believe infringes your rights</h2>
        <p>Email {email} with the subject “Copyright notice” and include:</p>
        <ul>
          <li>the address (URL) of the page and the title of the work;</li>
          <li>a description of the work you own or represent, and how you can show that;</li>
          <li>your name, your role (owner or authorised representative) and how to reach you;</li>
          <li>a statement that you believe in good faith the listing is not authorised by the rights holder, the law or the licence;</li>
          <li>a statement that the information in your notice is accurate.</li>
        </ul>
        <p><a className="btn" href={mail('Copyright notice')}>Send a copyright notice</a></p>
        <h2>What we do with a report</h2>
        <ol>
          <li>We record the report and remove the download from public view while we review it.</li>
          <li>A reviewer checks the evidence and the source. Where the rights cannot be confirmed, the item stays removed.</li>
          <li>We tell the person who reported it, and the submitter if we can, what we decided.</li>
          <li>If the submitter disputes a removal, we will consider evidence of their rights. We may ask both sides for more information.</li>
          <li>We may end the access of anyone who repeatedly submits infringing material.</li>
        </ol>
        <p>Every removal is logged in the project’s takedown record, and the reason is kept so the same item is not republished by mistake.</p>
        <p className="muted small">This page describes our process. It is general information and not legal advice, and it does not claim any particular statutory status.</p>
      </section>
    </>
  );
}

export function NotFound() {
  useSeo('Page not found', 'The page you requested does not exist on NaijaFreeDownload.', { noindex: true });
  return (
    <>
      <PageHeader title="Page not found">This address does not match any page on NaijaFreeDownload.</PageHeader>
      <p><Link className="btn" to="/">Go to the home page</Link></p>
    </>
  );
}

export function PrivacyPolicy() {
  usePageSeo();
  return (
    <>
      <PageHeader title="Privacy Policy">What we collect, what third parties may collect, and the choices you have.</PageHeader>
      <section className="panel prose">
        <p><strong>Last updated: {UPDATED}</strong></p>
        <h2>The short version</h2>
        <p>You do not need an account to use NaijaFreeDownload. We do not ask for your name or other personal details to browse. We do not currently run analytics or advertising. If that changes, this page will say so before it starts.</p>
        <h2>Information we handle</h2>
        <ul>
          <li><strong>Server logs.</strong> Our hosting provider, Cloudflare, processes technical data such as IP address, browser type, requested pages and timestamps to deliver and protect the site.</li>
          <li><strong>Email you send us.</strong> If you write to {email}, we receive what you include and use it only to answer, review submissions or handle copyright reports.</li>
          <li><strong>Browser storage.</strong> The site stores nothing in your browser unless advertising is switched on, in which case it saves your cookie choice (“nfd_ad_consent_v1”) so we do not ask again.</li>
        </ul>
        <h2>Third-party services that see your visit</h2>
        <p>Pages load artwork and previews directly from the providers of our information, so those providers receive your IP address and browser details when you view a page that uses them: TMDB (image.tmdb.org), Apple (artwork and previews), AniList, and YouTube (youtube-nocookie.com) when an official trailer is shown on a movie page. When you open an external listening, viewing or download link, that website’s own privacy practices apply.</p>
        <h2>Advertising (when enabled)</h2>
        <p>If we turn on Google AdSense, Google and its partners may use cookies and similar technologies to show and measure ads and may collect information such as your IP address and the pages you visit. Ads would appear only on some content pages, are labelled “Advertisement”, and would load only if you click “Accept ads cookies”. You can change your mind at any time with the “Ad cookie choices” link in the footer. To learn how Google uses data from sites that use its services, see <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Google’s explanation</a>, and manage personalised ads at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
        <h2>Analytics</h2>
        <p>We do not currently use analytics. If we add privacy-conscious, aggregate analytics we will describe it here first.</p>
        <h2>Sharing and retention</h2>
        <p>We do not sell personal information. Emails are kept only as long as needed to deal with the matter, including keeping a record of copyright reports. We may disclose information if the law requires it.</p>
        <h2>Your choices and rights</h2>
        <p>Depending on where you live, you may have the right to ask for access to, correction of, or deletion of personal information we hold, or to object to processing. Email {email} and tell us what you want. You can also clear cookies and site data in your browser at any time.</p>
        <h2>Children</h2>
        <p>The site is general-audience and is not directed at children under 13. We do not knowingly collect personal information from children.</p>
        <h2>Changes</h2>
        <p>If we change this policy we will update the date above.</p>
      </section>
    </>
  );
}

export function Terms() {
  usePageSeo();
  return (
    <>
      <PageHeader title="Terms and Conditions">The rules for using NaijaFreeDownload.</PageHeader>
      <section className="panel prose">
        <p><strong>Last updated: {UPDATED}</strong></p>
        <h2>1. The service</h2>
        <p>NaijaFreeDownload provides information about music, films, anime and documentaries, and links to official sources. Some items may offer a download that has been verified as authorised. We do not host media files and we do not own the works described.</p>
        <h2>2. Lawful use</h2>
        <p>Use the site lawfully and respect copyright, licence terms and the terms of the external services you visit. Do not use the site to request, share or promote unauthorised copies of copyrighted works.</p>
        <h2>3. Accuracy and availability</h2>
        <p>Information comes from third-party providers and may be incomplete or change. Links and downloads may stop working. Check the licence and terms shown for a work before you copy, share or reuse it.</p>
        <h2>4. Submissions</h2>
        <p>If you submit a work, you confirm that you own it or have permission, that your information is accurate, and that you have identified its licence. You allow us to display the submitted details and artwork to present the listing. You keep ownership of your work. We may reject, hold back or remove any submission where rights or accuracy cannot be established.</p>
        <h2>5. Copyright reports</h2>
        <p>We handle reports as described on the <Link to="/copyright">copyright and takedown page</Link>. We may remove a disputed listing while we review it.</p>
        <h2>6. External sites</h2>
        <p>We do not control external websites and are not responsible for their content, availability, terms or privacy practices.</p>
        <h2>7. Advertising</h2>
        <p>If advertising appears, it is provided by third parties, is labelled, and is separate from our content. We do not endorse advertised products. Please do not click ads except because you are genuinely interested in them.</p>
        <h2>8. Acceptable behaviour</h2>
        <ul>
          <li>Do not try to disrupt, damage or gain unauthorised access to the site.</li>
          <li>Do not upload malware, abusive or misleading material.</li>
          <li>Do not use automated means in a way that harms the service.</li>
        </ul>
        <h2>9. Changes to the service and terms</h2>
        <p>We may change or remove parts of the site, or update these terms. Continuing to use the site after an update means you accept the updated terms.</p>
        <h2>10. Disclaimer and liability</h2>
        <p>The site is provided “as is” and “as available”. To the extent the law allows, we do not guarantee that it will be uninterrupted, error-free or accurate, and we are not liable for indirect or consequential loss from using it or the services it links to. Nothing here limits rights or liability that cannot be limited by law.</p>
        <h2>11. Contact</h2>
        <p>Questions about these terms: {email}. These terms are general information and not legal advice.</p>
      </section>
    </>
  );
}
