import { useParams } from 'react-router-dom';
import { useApp, usePageSEO } from '../hooks/index.jsx';
import { formatDate, md } from '../utils/helpers.js';
import PageHero from '../components/PageHero.jsx';
import { I } from '../components/ui.jsx';
import ContactForm from '../components/ContactForm.jsx';
import NotFound from './NotFound.jsx';

/** Privacy, Terms and Contact. Text lives in data/pages.json; contact details in data/company.csv. */
export default function StaticPage() {
  const { slug } = useParams();
  const { config } = useApp();
  const page = config.pages.static?.[slug];
  const co = config.company;
  usePageSEO(page ? { title: page.title, description: page.intro, image: page.image, path: `/page/${slug}` } : { title: 'Page' }, [slug]);
  if (!page) return <NotFound what="page" />;

  const contacts = [
    co.email && ['fa-regular fa-envelope', 'Email', co.email, `mailto:${co.email}`],
    co.phone && ['fa-solid fa-phone', 'Phone', co.phone, `tel:${co.phone.replace(/[^+\d]/g, '')}`],
    co.whatsapp && ['fa-brands fa-whatsapp', 'WhatsApp', 'Chat with us on WhatsApp', co.whatsapp],
    co.address && ['fa-solid fa-location-dot', 'Address', co.address],
    co.maps && ['fa-solid fa-map-location-dot', 'Find us', 'Open in Google Maps', co.maps],
    co.hours && ['fa-regular fa-clock', 'Hours', co.hours],
  ].filter(Boolean);

  return (
    <>
      <PageHero title={page.title} subtitle={page.intro} image={page.image || config.tagImages?.default} compact
        crumbs={[{ label: 'Home', href: '/' }, { label: page.title }]}>
        {page.updated && <p className="page-hero__meta"><I c="fa-regular fa-calendar" /> Last updated {formatDate(page.updated)}</p>}
      </PageHero>
      <div className="container container--narrow section">
        {slug === 'contact' && (
          <ul className="contact-grid">
            {contacts.map(([icon, label, value, href]) => (
              <li key={label} className="contact-card">
                <span><I c={icon} /></span>
                <div><strong>{label}</strong>{href ? <a href={href}>{value}</a> : <em>{value}</em>}</div>
              </li>
            ))}
          </ul>
        )}
        {slug === 'contact' && <ContactForm endpoint={co.contactEndpoint} email={co.email} />}
        {page.sections.length > 0 && (
          <div className="policy">
            {page.sections.map((s, i) => (
              <section key={s.heading} className="policy__item">
                <span className="policy__num">{i + 1}</span>
                <div><h2>{s.heading}</h2><div className="static-md" dangerouslySetInnerHTML={{ __html: md(s.body) }} /></div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
