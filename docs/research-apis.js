/**
 * Margots research API registry.
 * Uses public/keyless endpoints only. No third-party credentials are embedded.
 */
(function (root) {
  'use strict';

  const APIs = {
    europePMC: {
      name: 'Europe PMC',
      category: 'literature',
      keyRequired: false,
      search: q => `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q)}&format=json&pageSize=10`
    },
    openAlex: {
      name: 'OpenAlex',
      category: 'literature',
      keyRequired: false,
      search: q => `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per_page=10`
    },
    crossref: {
      name: 'Crossref',
      category: 'literature',
      keyRequired: false,
      search: q => `https://api.crossref.org/works?query=${encodeURIComponent(q)}&rows=10`
    },
    uniprot: {
      name: 'UniProt',
      category: 'proteins',
      keyRequired: false,
      search: q => `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(q)}&format=json&size=10`
    },
    ncbi: {
      name: 'NCBI E-utilities',
      category: 'biomedical',
      keyRequired: false,
      search: q => `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(q)}&retmode=json&retmax=10`
    },
    ensembl: {
      name: 'Ensembl REST',
      category: 'genomics',
      keyRequired: false,
      lookup: id => `https://rest.ensembl.org/lookup/id/${encodeURIComponent(id)}?content-type=application/json`
    },
    pdb: {
      name: 'RCSB PDB',
      category: 'structures',
      keyRequired: false,
      search: q => `https://search.rcsb.org/rcsbsearch/v2/query?json=${encodeURIComponent(JSON.stringify({query:{type:'terminal',service:'full_text',parameters:{value:q}}}))}`
    },
    pubchem: {
      name: 'PubChem PUG REST',
      category: 'chemistry',
      keyRequired: false,
      compound: name => `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`
    },
    chembl: {
      name: 'ChEMBL',
      category: 'drug-discovery',
      keyRequired: false,
      search: q => `https://www.ebi.ac.uk/chembl/api/data/molecule/search?q=${encodeURIComponent(q)}&format=json&page_size=10`
    },
    clinicalTrials: {
      name: 'ClinicalTrials.gov',
      category: 'clinical-research',
      keyRequired: false,
      search: q => `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(q)}&pageSize=10&format=json`
    },
    semanticScholar: {
      name: 'Semantic Scholar',
      category: 'literature',
      keyRequired: false,
      search: q => `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(q)}&limit=10&fields=title,authors,year,abstract,url,externalIds`
    }
  };

  async function request(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  }

  async function searchAll(query) {
    const jobs = Object.entries(APIs)
      .filter(([, api]) => typeof api.search === 'function')
      .map(async ([id, api]) => {
        try {
          return { id, api: api.name, category: api.category, data: await request(api.search(query)) };
        } catch (error) {
          return { id, api: api.name, category: api.category, error: error.message };
        }
      });
    return Promise.all(jobs);
  }

  root.MargotsResearchAPIs = { APIs, request, searchAll };
})(typeof window !== 'undefined' ? window : globalThis);
