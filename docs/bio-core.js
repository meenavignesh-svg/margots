/**
 * Margots deterministic sequence engine (browser + Node testable).
 * AI interpretation is NEVER computed here — only measurable facts.
 *
 * Tm references:
 * - Wallace rule (oligonucleotides): Tm ≈ 2°C*(A+T) + 4°C*(G+C)
 *   Wallace RB et al. (1979) Nucleic Acids Res. 6:3543–3557.
 * - Marmur–Schildkraut–Doty approximation for longer DNA:
 *   Tm ≈ 81.5 + 16.6*log10([Na+]) + 0.41*(%GC) − 600/N  (Na+ assumed 0.1 M here)
 *   Marmur J & Doty P (1962) J Mol Biol. 5:109–118.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MargotsBio = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CODON = {
    TTT:'F',TTC:'F',TTA:'L',TTG:'L',CTT:'L',CTC:'L',CTA:'L',CTG:'L',
    ATT:'I',ATC:'I',ATA:'I',ATG:'M',GTT:'V',GTC:'V',GTA:'V',GTG:'V',
    TCT:'S',TCC:'S',TCA:'S',TCG:'S',CCT:'P',CCC:'P',CCA:'P',CCG:'P',
    ACT:'T',ACC:'T',ACA:'T',ACG:'T',GCT:'A',GCC:'A',GCA:'A',GCG:'A',
    TAT:'Y',TAC:'Y',TAA:'*',TAG:'*',CAT:'H',CAC:'H',CAA:'Q',CAG:'Q',
    AAT:'N',AAC:'N',AAA:'K',AAG:'K',GAT:'D',GAC:'D',GAA:'E',GAG:'E',
    TGT:'C',TGC:'C',TGA:'*',TGG:'W',CGT:'R',CGC:'R',CGA:'R',CGG:'R',
    AGT:'S',AGC:'S',AGA:'R',AGG:'R',GGT:'G',GGC:'G',GGA:'G',GGG:'G'
  };
  const COMP = { A:'T', T:'A', G:'C', C:'G', U:'A', N:'N' };

  function normalize(seq) {
    return String(seq || '').toUpperCase().replace(/\s+/g, '').replace(/U/g, 'T');
  }

  function baseCounts(seq) {
    const s = normalize(seq);
    const c = { A:0, C:0, G:0, T:0, N:0, other:0 };
    for (const ch of s) {
      if (c[ch] !== undefined) c[ch]++;
      else c.other++;
    }
    return c;
  }

  function gcPercent(seq) {
    const s = normalize(seq);
    if (!s.length) return null;
    const c = baseCounts(s);
    const known = c.A + c.C + c.G + c.T;
    if (!known) return null;
    return Math.round(((c.G + c.C) / known) * 10000) / 100;
  }

  function reverseComplement(seq) {
    const s = normalize(seq);
    let out = '';
    for (let i = s.length - 1; i >= 0; i--) out += COMP[s[i]] || 'N';
    return out;
  }

  function translate(seq, frame) {
    frame = frame || 0;
    const s = normalize(seq).slice(frame);
    let aa = '';
    for (let i = 0; i + 2 < s.length; i += 3) {
      const codon = s.slice(i, i + 3);
      aa += CODON[codon] || 'X';
    }
    return aa;
  }

  function findORFs(seq, minAa) {
    minAa = minAa || 10;
    const s = normalize(seq);
    const orfs = [];
    for (let frame = 0; frame < 3; frame++) {
      let i = frame;
      while (i + 2 < s.length) {
        const codon = s.slice(i, i + 3);
        if (codon === 'ATG') {
          let j = i + 3;
          let aa = 'M';
          while (j + 2 < s.length) {
            const c = s.slice(j, j + 3);
            if (c === 'TAA' || c === 'TAG' || c === 'TGA') {
              if (aa.length >= minAa) {
                orfs.push({
                  frame: frame + 1,
                  start: i + 1,
                  end: j + 3,
                  length_aa: aa.length,
                  length_nt: j + 3 - i,
                  protein_preview: aa.slice(0, 60)
                });
              }
              i = j + 3;
              break;
            }
            aa += CODON[c] || 'X';
            j += 3;
          }
          if (j + 2 >= s.length) break;
        } else i += 3;
      }
    }
    return orfs;
  }

  /** Wallace oligo Tm (°C). Valid for short primers ~14–20 nt. */
  function tmWallace(seq) {
    const s = normalize(seq);
    if (s.length < 8 || s.length > 30) return null;
    const c = baseCounts(s);
    return 2 * (c.A + c.T) + 4 * (c.G + c.C);
  }

  /** Rough long-DNA Tm at ~0.1 M Na+ (Marmur–Doty style). */
  function tmMarmur(seq) {
    const s = normalize(seq);
    if (s.length < 14) return null;
    const gc = gcPercent(s);
    if (gc === null) return null;
    const na = 0.1;
    return Math.round((81.5 + 16.6 * Math.log10(na) + 0.41 * gc - 600 / s.length) * 10) / 10;
  }

  function classify(seq) {
    const raw = String(seq || '').toUpperCase().replace(/\s+/g, '');
    if (!raw) return { kind: 'empty' };
    const dna = /^[ACGTN]+$/.test(raw);
    const rna = /^[ACGUN]+$/.test(raw);
    if (dna && !raw.includes('U')) return { kind: 'DNA', seq: raw };
    if (rna && !raw.includes('T')) return { kind: 'RNA', seq: raw.replace(/U/g, 'T'), note: 'U treated as T for analysis' };
    if (/^[ACDEFGHIKLMNPQRSTVWYBXZJUO*-]+$/i.test(raw) && !/^[ACGTUN]+$/i.test(raw))
      return { kind: 'protein', seq: raw };
    return { kind: 'unknown', seq: raw };
  }

  function parseFasta(text) {
    const records = [];
    let header = null, buf = [];
    String(text || '').split(/\r?\n/).forEach(line => {
      if (line.startsWith('>')) {
        if (header !== null) records.push({ header, sequence: buf.join('') });
        header = line.slice(1).trim();
        buf = [];
      } else if (header !== null) buf.push(line.replace(/\s+/g, ''));
    });
    if (header !== null) records.push({ header, sequence: buf.join('') });
    return records;
  }

  function analyze(seq) {
    const cls = classify(seq);
    if (cls.kind === 'empty') return null;
    if (cls.kind === 'protein') {
      return {
        layer: 'DETERMINISTIC',
        kind: 'protein',
        length: cls.seq.length,
        preview: cls.seq.slice(0, 120),
        note: 'Amino-acid string detected. Nucleotide metrics not applied.'
      };
    }
    if (cls.kind === 'unknown') {
      return { layer: 'DETERMINISTIC', kind: 'unknown', length: cls.seq.length, preview: cls.seq.slice(0, 80) };
    }
    const s = cls.seq;
    const counts = baseCounts(s);
    const gc = gcPercent(s);
    const orfs = findORFs(s, 10);
    return {
      layer: 'DETERMINISTIC',
      kind: cls.kind,
      length: s.length,
      base_counts: counts,
      gc_percent: gc,
      reverse_complement_preview: reverseComplement(s).slice(0, 120),
      translation_frame1_preview: translate(s, 0).slice(0, 80),
      orf_count: orfs.length,
      orfs_top: orfs.slice(0, 5),
      tm_wallace_c: tmWallace(s),
      tm_marmur_c: tmMarmur(s),
      formula_notes: {
        tm_wallace: '2*(A+T)+4*(G+C); Wallace et al. 1979; for short oligos',
        tm_marmur: '81.5+16.6*log10([Na+])+0.41*%GC-600/N; Na+=0.1M approx'
      }
    };
  }

  return {
    normalize, baseCounts, gcPercent, reverseComplement, translate,
    findORFs, tmWallace, tmMarmur, classify, parseFasta, analyze, CODON
  };
});
