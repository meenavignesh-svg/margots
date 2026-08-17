/**
 * Public research APIs — no API key required for basic use.
 * Sources: Europe PMC (PubMed-indexed), OpenAlex, UniProt.
 * Results are evidence snippets for context; not scraped paywalled full text.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MargotsLiterature = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  async function europePMC(query, pageSize) {
    pageSize = pageSize || 5;
    const url = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query='
      + encodeURIComponent(query) + '&format=json&pageSize=' + pageSize;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Europe PMC HTTP ' + r.status);
    const j = await r.json();
    const list = j.resultList?.result || [];
    return list.map(x => ({
      source: 'EuropePMC',
      id: x.pmid || x.id,
      title: x.title || '',
      authors: x.authorString || '',
      year: x.pubYear || '',
      journal: x.journalTitle || '',
      abstract: (x.abstractText || '').slice(0, 600),
      url: x.pmid
        ? 'https://pubmed.ncbi.nlm.nih.gov/' + x.pmid + '/'
        : (x.doi ? 'https://doi.org/' + x.doi : 'https://europepmc.org/article/MED/' + (x.id || ''))
    }));
  }

  async function openAlex(query, perPage) {
    perPage = perPage || 5;
    const url = 'https://api.openalex.org/works?search='
      + encodeURIComponent(query) + '&per_page=' + perPage
      + '&mailto=margots-open-source@example.com';
    const r = await fetch(url);
    if (!r.ok) throw new Error('OpenAlex HTTP ' + r.status);
    const j = await r.json();
    return (j.results || []).map(w => ({
      source: 'OpenAlex',
      id: w.id,
      title: w.title || w.display_name || '',
      year: w.publication_year || '',
      abstract: '',
      url: w.doi ? 'https://doi.org/' + String(w.doi).replace('https://doi.org/', '')
        : (w.primary_location?.landing_page_url || w.id || '')
    }));
  }

  async function uniProt(query, size) {
    size = size || 3;
    const url = 'https://rest.uniprot.org/uniprotkb/search?query='
      + encodeURIComponent(query) + '&format=json&size=' + size;
    const r = await fetch(url);
    if (!r.ok) throw new Error('UniProt HTTP ' + r.status);
    const j = await r.json();
    return (j.results || []).map(x => ({
      source: 'UniProt',
      id: x.primaryAccession,
      title: x.proteinDescription?.recommendedName?.fullName?.value
        || x.uniProtkbId || x.primaryAccession,
      organism: x.organism?.scientificName || '',
      url: 'https://www.uniprot.org/uniprotkb/' + x.primaryAccession + '/entry'
    }));
  }

  /** Parallel public literature pull. Failures are isolated. */
  async function searchAll(query) {
    const jobs = [
      europePMC(query, 5).catch(e => ({ error: String(e.message || e), source: 'EuropePMC' })),
      openAlex(query, 5).catch(e => ({ error: String(e.message || e), source: 'OpenAlex' })),
      uniProt(query, 3).catch(e => ({ error: String(e.message || e), source: 'UniProt' }))
    ];
    const out = await Promise.all(jobs);
    const papers = [];
    const errors = [];
    for (const block of out) {
      if (Array.isArray(block)) papers.push(...block);
      else if (block && block.error) errors.push(block);
    }
    return { papers, errors, query };
  }

  function formatContext(result) {
    if (!result || !result.papers || !result.papers.length) {
      return 'LITERATURE: no public hits (or APIs blocked by network/CORS).';
    }
    return 'LITERATURE (public APIs — verify before citing):\n' + result.papers.map((p, i) => {
      return (i + 1) + '. [' + p.source + '] ' + (p.title || 'untitled')
        + (p.year ? ' (' + p.year + ')' : '')
        + (p.url ? '\n   ' + p.url : '')
        + (p.abstract ? '\n   ' + p.abstract.slice(0, 280) : '');
    }).join('\n');
  }

  return { europePMC, openAlex, uniProt, searchAll, formatContext };
});
