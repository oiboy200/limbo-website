(() => {
  const React = window.CMS && window.CMS.React;
  if (!React) return;
  const h = React.createElement;
  const { useEffect, useState } = React;

  const getData = (entry) => {
    const value = entry && entry.getIn ? entry.getIn(['data']) : null;
    return value && value.toJS ? value.toJS() : {};
  };
  const img = (src, alt, className) => src
    ? h('img', { src, alt: alt || '', className: className || '', loading: 'lazy' })
    : h('div', { className: 'limbo-preview-placeholder' }, 'Immagine non impostata');

  function HomePreview({ entry, getAsset }) {
    const data = getData(entry);
    const [media, setMedia] = useState({});
    useEffect(() => {
      fetch('/content/shared-media.json', { cache: 'no-store' })
        .then((r) => r.ok ? r.json() : {})
        .then(setMedia)
        .catch(() => setMedia({}));
    }, []);
    const assetUrl = (path) => {
      if (!path) return '';
      const asset = getAsset && getAsset(path);
      return asset && asset.url ? asset.url : path;
    };
    const workshop = assetUrl(media.home_workshop);
    const custom = assetUrl(media.home_custom);
    const about = assetUrl(media.home_about);
    return h('main', { className: 'limbo-live-preview' },
      h('div', { className: 'lp-top' }, h('span', null, 'LIMBO / STUDIO'), h('span', null, 'HOMEPAGE')),
      h('section', { className: 'lp-hero' },
        h('p', { className: 'lp-kicker' }, 'VICENZA — ITALIA'),
        h('h1', { 'data-key-path': 'hero_intro', tabIndex: 0 }, data.hero_intro || 'Intro homepage')
      ),
      h('section', { className: 'lp-split' },
        h('div', null, h('p', { className: 'lp-kicker' }, data.workshop_eyebrow || '01 / WORKSHOP'),
          h('h2', { 'data-key-path': 'workshop_title', tabIndex: 0 }, data.workshop_title || ''),
          h('p', { 'data-key-path': 'workshop_text', tabIndex: 0 }, data.workshop_text || '')),
        img(workshop, 'Workshop')
      ),
      h('section', { className: 'lp-split lp-reverse' },
        img(custom, 'Su misura'),
        h('div', null, h('p', { className: 'lp-kicker' }, '02 / SU MISURA'),
          h('h2', null, 'Cornici e specchi su misura'))
      ),
      h('section', { className: 'lp-manifesto' },
        h('p', { className: 'lp-kicker' }, '03 / MANIFESTO'),
        h('h2', { 'data-key-path': 'manifesto_title', tabIndex: 0 }, data.manifesto_title || '')
      ),
      h('section', { className: 'lp-split' },
        h('div', null, h('p', { className: 'lp-kicker' }, '04 / STUDIO'),
          h('h2', null, 'Uno sguardo attento alle immagini')),
        img(about, 'About')
      ),
      h('section', { className: 'lp-contact' },
        h('h2', { 'data-key-path': 'contact_cta', tabIndex: 0 }, data.contact_cta || 'Contatti'),
        h('span', null, 'LIMBO CORNICI — VICENZA')
      )
    );
  }

  function PagePreview({ entry, getAsset }) {
    const data = getData(entry);
    const imageAsset = data.image && getAsset ? getAsset(data.image) : null;
    const imageSrc = imageAsset?.url || data.image;
    return h('main', { className: 'limbo-live-preview' },
      h('div', { className: 'lp-top' }, h('span', null, 'LIMBO / STUDIO'), h('span', null, data.eyebrow || 'PAGINA')),
      h('section', { className: 'lp-page-hero' },
        h('p', { className: 'lp-kicker', 'data-key-path': 'eyebrow' }, data.eyebrow || ''),
        h('h1', { 'data-key-path': 'title', tabIndex: 0 }, data.title || ''),
        h('p', { className: 'lp-lead', 'data-key-path': 'lead', tabIndex: 0 }, data.lead || '')
      ),
      imageSrc ? h('div', { className: 'lp-page-image' }, img(imageSrc, data.title)) : null,
      h('article', { className: 'lp-body', 'data-key-path': 'body', tabIndex: 0 },
        h('div', { dangerouslySetInnerHTML: { __html: data.body || '' } })
      )
    );
  }

  function ProjectsPreview({ entry, getAsset }) {
    const data = getData(entry);
    const projects = Array.isArray(data.projects) ? data.projects : [];
    return h('main', { className: 'limbo-live-preview' },
      h('div', { className: 'lp-top' }, h('span', null, 'LIMBO / STUDIO'), h('span', null, 'PROGETTI')),
      h('h1', null, 'Progetti'),
      h('div', { className: 'lp-grid' }, projects.map((p, i) => {
        const asset = p.cover && getAsset ? getAsset(p.cover) : null;
        return h('article', { className: 'lp-project', key: p.slug || i },
          img(asset?.url || p.cover, p.title),
          h('h2', { 'data-key-path': 'projects.' + i + '.title', tabIndex: 0 }, p.title || ''),
          h('p', { 'data-key-path': 'projects.' + i + '.category', tabIndex: 0 }, p.category || ''),
          h('div', { 'data-key-path': 'projects.' + i + '.description', tabIndex: 0 }, p.description || '')
        );
      }))
    );
  }

  function GalleryPreview({ entry, getAsset }) {
    const data = getData(entry);
    const collections = Array.isArray(data.collections) ? data.collections : [];
    return h('main', { className: 'limbo-live-preview' },
      h('div', { className: 'lp-top' }, h('span', null, 'LIMBO / STUDIO'), h('span', null, 'ARCHIVIO SU MISURA')),
      h('h1', null, 'Archivio Su misura'),
      collections.map((item, i) => {
        const heroAsset = item.hero && getAsset ? getAsset(item.hero) : null;
        const images = Array.isArray(item.images) ? item.images : [];
        return h('section', { className: 'lp-gallery-section', key: item.title || i },
          h('h2', { 'data-key-path': 'collections.' + i + '.title', tabIndex: 0 }, item.title || ''),
          img(heroAsset?.url || item.hero, item.title, 'lp-gallery-hero'),
          h('div', { className: 'lp-grid' }, images.map((path, j) => {
            const asset = getAsset ? getAsset(path) : null;
            return h('div', { key: j }, img(asset?.url || path, item.title));
          }))
        );
      })
    );
  }

  CMS.registerPreviewStyle('/admin/preview.css');
  CMS.registerPreviewTemplate('home', HomePreview);
  CMS.registerPreviewTemplate('about', PagePreview);
  CMS.registerPreviewTemplate('custom', PagePreview);
  CMS.registerPreviewTemplate('contact', PagePreview);
  CMS.registerPreviewTemplate('projects', ProjectsPreview);
  CMS.registerPreviewTemplate('custom_gallery', GalleryPreview);
})();