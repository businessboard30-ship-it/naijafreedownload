import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { CONTACT_EMAIL, ISSUES_URL } from '../config/site';
import { useSeo } from '../lib/useSeo';

const contact = CONTACT_EMAIL
  ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  : <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">the project issue tracker</a>;


export function Contact() {
  useSeo('Contact us', 'Contact the NaijaFreeDownload team for general enquiries, creator submissions, corrections and copyright concerns.');
  return (
    <>
      <PageHeader title="Contact us">Questions, feedback or a concern about a listing? Get in touch with the NaijaFreeDownload team.</PageHeader>
      <section className="panel prose">
        <h2>Email</h2>
        <p>For general enquiries, feedback, corrections and support, email us at {contact}.</p>
        <p><a className="btn" href={`mailto:${CONTACT_EMAIL}?subject=NaijaFreeDownload%20enquiry`}>Email NaijaFreeDownload</a></p>
        <h2>Creator submissions</h2>
        <p>Artists, filmmakers and rights holders can contact us with release details and evidence that the work may be distributed. Please review our <Link to="/creators">creator submission requirements</Link>.</p>
        <h2>Copyright concerns</h2>
        <p>For copyright or licensing concerns, include the page URL, the title of the affected work and information showing your relationship to the rights. See our <Link to="/copyright">copyright and takedown policy</Link>.</p>
        <p>We aim to review messages as promptly as possible. Please do not send passwords, payment details or other sensitive information by email.</p>
      </section>
    </>
  );
}

export function Creators() {
  useSeo('For creators', 'How to submit music, films and documentaries from anywhere in the world to NaijaFreeDownload, and what licence information is required.');
  return (
    <>
      <PageHeader title="For creators">Share your work with a global audience under a licence that lets people download it legally.</PageHeader>
      <section className="panel prose">
        <h2>Submission requirements</h2>
        <ul>
          <li>You own the work or hold written permission from the rights holder.</li>
          <li>The work is public domain, or carries a named licence (for example Creative Commons) with a link to its terms.</li>
          <li>The download is served over HTTPS from a source you control or a recognised archive.</li>
          <li>You provide title, description, category, release date, country or region, language, file format, file size and cover art.</li>
        </ul>
        <h2>How to submit</h2>
        <p>Send the release details and proof of rights through {contact}. Submissions from creators worldwide are reviewed before they are added to the catalogue.</p>
        <h2>Catalogue entry format</h2>
        <p>Approved releases are added to <code>public/data/releases.json</code>. The field list is documented in the project README.</p>
      </section>
    </>
  );
}

export function About() {
  useSeo('About', 'About NaijaFreeDownload, a worldwide discovery catalogue for legally available music, films and documentaries.');
  return (
    <>
      <PageHeader title="About">A worldwide destination to discover music, movies and documentaries.</PageHeader>
      <section className="panel prose">
        <p>NaijaFreeDownload is open to entertainment from every country and region. Discover Hollywood, Nollywood, Bollywood, European cinema, Korean and Japanese films, African cinema, independent productions, documentaries and music from artists worldwide.</p>
        <p>Country, language and genre should help visitors explore the full international catalogue; no country or region is the platform's limit. Every downloadable entry must be public domain, creator-authorised or properly licensed, with its rights and source clearly identified.</p>
        <p>The site does not host copyrighted media without permission or link to unauthorised copies. Creators worldwide can read <Link to="/creators">the submission requirements</Link>.</p>
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



export function PrivacyPolicy() {
  useSeo('Privacy Policy', 'Learn how NaijaFreeDownload handles information, website usage, contact messages and third-party services.');
  return (
    <>
      <PageHeader title="Privacy Policy">What information may be handled when you visit or contact NaijaFreeDownload.</PageHeader>
      <section className="panel prose">
        <p><strong>Last updated: 20 November 2026</strong></p>
        <h2>Who we are</h2>
        <p>NaijaFreeDownload is an entertainment discovery catalogue for music, films and documentaries. For privacy questions, contact <a href="mailto:businessboard30@gmail.com">businessboard30@gmail.com</a>.</p>
        <h2>Information you provide</h2>
        <p>If you email us, we receive the information and contact details you choose to include. If you submit a release or rights complaint through a site feature or by email, we may use the details you provide to review the submission, verify permissions, respond to you and maintain the catalogue.</p>
        <h2>Technical information</h2>
        <p>When you visit a website, the hosting and security providers may process technical information such as IP address, browser type, requested pages, timestamps and diagnostic or security logs to deliver, protect and troubleshoot the service. The site may also use essential browser storage for basic preferences or functionality.</p>
        <h2>Cookies, analytics and advertising</h2>
        <p>Some features or third-party services may use cookies or similar technologies. If analytics or advertising services are enabled, those providers may collect information about visits and interactions in accordance with their own policies and your applicable privacy choices. We will update this notice when such services are introduced and identify them where required. You can manage cookies through your browser settings.</p>
        <h2>Third-party websites and services</h2>
        <p>Our catalogue may link to external music, film, archive, information or creator websites. When you follow an external link, that provider's privacy practices apply. We do not control third-party websites and encourage you to read their privacy notices.</p>
        <h2>How information is used</h2>
        <ul>
          <li>To operate, secure and improve the website.</li>
          <li>To respond to enquiries and support requests.</li>
          <li>To review creator submissions, permissions and copyright complaints.</li>
          <li>To diagnose errors, prevent abuse and comply with applicable obligations.</li>
        </ul>
        <h2>Sharing and retention</h2>
        <p>We do not sell personal information. Information may be processed by service providers that help host, secure or operate the website, or disclosed when required by law or necessary to protect rights and safety. We retain information only for as long as reasonably needed for the purpose it was collected, including handling disputes and maintaining security records.</p>
        <h2>Your choices and rights</h2>
        <p>Depending on where you live, you may have rights to request access, correction or deletion of personal information, or to object to certain processing. To make a request, email <a href="mailto:businessboard30@gmail.com">businessboard30@gmail.com</a>. We may need to verify your request before responding.</p>
        <h2>Children</h2>
        <p>NaijaFreeDownload is not designed to knowingly collect personal information from children. If you believe a child has provided personal information, contact us so we can review the matter.</p>
        <h2>Changes</h2>
        <p>We may update this policy as the website and its services change. The latest version will be published on this page with its updated date.</p>
        <h2>Contact</h2>
        <p>Privacy questions: <a href="mailto:businessboard30@gmail.com">businessboard30@gmail.com</a>.</p>
      </section>
    </>
  );
}

export function Terms() {
  useSeo('Terms and Conditions', 'Terms for using NaijaFreeDownload, its entertainment catalogue, external links and submission features.');
  return (
    <>
      <PageHeader title="Terms and Conditions">Please read these terms before using NaijaFreeDownload.</PageHeader>
      <section className="panel prose">
        <p><strong>Last updated: 20 November 2026</strong></p>
        <h2>1. About the service</h2>
        <p>NaijaFreeDownload is an entertainment discovery catalogue intended to help visitors find music, films and documentaries and follow links to sources that make content available. The catalogue may include third-party links. We do not claim ownership of works unless expressly stated.</p>
        <h2>2. Lawful use</h2>
        <p>You agree to use the website only for lawful purposes and to respect copyright, licence terms, intellectual-property rights and the terms of external providers. Do not use the site to distribute, request or promote unauthorised copies of copyrighted works.</p>
        <h2>3. Content and availability</h2>
        <p>We aim to provide useful and accurate catalogue information, but listings, descriptions, availability and external links may change. We do not guarantee that every external destination will remain available, be error-free or be suitable for every visitor. Check the rights and terms stated by the source before downloading, sharing or using a work.</p>
        <h2>4. Creator submissions</h2>
        <p>If you submit content, you confirm that you own it or have sufficient permission to submit it and that the information you provide is accurate. You must identify applicable licences and restrictions. You grant us permission to display the metadata and promotional materials you submit for the purpose of operating and presenting the catalogue. This does not transfer ownership of your work to us. We may reject, edit for clarity, suspend or remove a submission where rights or accuracy cannot be established.</p>
        <h2>5. Copyright complaints</h2>
        <p>Rights holders may report a listing through our <Link to="/copyright">copyright and takedown page</Link> or by emailing <a href="mailto:businessboard30@gmail.com">businessboard30@gmail.com</a>. We may temporarily disable access to a disputed listing while reviewing a credible complaint.</p>
        <h2>6. External websites</h2>
        <p>Links to third-party websites are provided for convenience. We do not operate or control those services and are not responsible for their content, availability, terms, privacy practices or security. Your use of an external service is at your discretion and subject to its own terms.</p>
        <h2>7. Prohibited conduct</h2>
        <ul>
          <li>Attempting to disrupt, damage or gain unauthorised access to the website or its systems.</li>
          <li>Uploading malware, abusive material or misleading information.</li>
          <li>Infringing copyright, trademarks, privacy or other rights.</li>
          <li>Using automated means in a way that harms the service or violates applicable rules.</li>
        </ul>
        <h2>8. Service changes</h2>
        <p>We may change, suspend or discontinue parts of the website, remove listings or update these terms as the service develops. Continued use after updated terms are posted means you accept the revised terms to the extent permitted by law.</p>
        <h2>9. Disclaimer</h2>
        <p>The website is provided on an “as is” and “as available” basis. To the extent permitted by applicable law, we disclaim warranties that the service will always be uninterrupted, secure, accurate or available. Nothing in these terms excludes rights or remedies that cannot legally be excluded.</p>
        <h2>10. Limitation of liability</h2>
        <p>To the extent permitted by applicable law, NaijaFreeDownload is not liable for indirect or consequential loss arising from use of the website or third-party services. Nothing in these terms limits liability where doing so would be unlawful.</p>
        <h2>11. Contact</h2>
        <p>Questions about these terms: <a href="mailto:businessboard30@gmail.com">businessboard30@gmail.com</a>.</p>
        <p>These terms are general website terms and are not a substitute for advice from a qualified lawyer about your particular circumstances.</p>
      </section>
    </>
  );
}
