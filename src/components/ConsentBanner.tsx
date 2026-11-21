import { Link } from 'react-router-dom';
import { ADS } from '../config/ads';
import { useConsent, writeConsent } from '../lib/consent';

/** Shown only when advertising is configured. Accept and decline are equally prominent. */
export default function ConsentBanner() {
  const consent = useConsent();
  if (!ADS.enabled || consent !== null) return null;
  return (
    <section className="consent" role="dialog" aria-label="Advertising cookies" aria-live="polite">
      <p>
        We would like to show ads from Google AdSense, which use cookies or similar technologies. The site works the same
        whichever you choose. Read how we use cookies in our <Link to="/privacy">Privacy Policy</Link>.
      </p>
      <div className="consent-actions">
        <button className="btn" type="button" onClick={() => writeConsent('denied')}>Decline ads cookies</button>
        <button className="btn" type="button" onClick={() => writeConsent('granted')}>Accept ads cookies</button>
      </div>
    </section>
  );
}
