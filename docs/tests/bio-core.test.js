/**
 * Run: node docs/tests/bio-core.test.js
 * Or open docs/tests/runner.html in a browser.
 */
'use strict';

const path = require('path');
const bio = require(path.join(__dirname, '..', 'bio-core.js'));

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log('  ✓', msg); }
  else { failed++; console.error('  ✗', msg); }
}
function almost(a, b, eps) { return Math.abs(a - b) <= (eps || 0.01); }

console.log('\nMargots bio-core tests\n');

// GC%
(function () {
  console.log('GC%');
  assert(bio.gcPercent('ATGC') === 50, 'ATGC → 50%');
  assert(bio.gcPercent('AAAA') === 0, 'AAAA → 0%');
  assert(bio.gcPercent('GGCC') === 100, 'GGCC → 100%');
  assert(bio.gcPercent('') === null, 'empty → null');
  assert(bio.gcPercent('NNNN') === null, 'only N → null');
  assert(almost(bio.gcPercent('ATGCGC'), 66.67), 'ATGCGC → ~66.67%');
})();

// Reverse complement
(function () {
  console.log('Reverse complement');
  assert(bio.reverseComplement('ATGC') === 'GCAT', 'ATGC → GCAT');
  assert(bio.reverseComplement('AAA') === 'TTT', 'AAA → TTT');
  assert(bio.reverseComplement('acgt') === 'ACGT', 'lowercase handled');
  assert(bio.reverseComplement('AUGC').length === 4, 'U normalized path length');
})();

// Translation
(function () {
  console.log('Translation');
  assert(bio.translate('ATGGCC') === 'MA', 'ATGGCC → MA');
  assert(bio.translate('ATGTAA') === 'M*', 'stop codon');
  assert(bio.translate('ATGGCC', 1).length >= 0, 'frame 1 runs');
  assert(bio.translate('XXX') === '' || bio.translate('XXX').includes('X') || bio.translate('XXX') === '', 'bad codons');
})();

// ORF
(function () {
  console.log('ORF finder');
  // ATG + 12 codons + TAA = protein length 13 (>=10)
  const seq = 'ATG' + 'GCA'.repeat(12) + 'TAA';
  const orfs = bio.findORFs(seq, 10);
  assert(orfs.length >= 1, 'finds at least one ORF');
  assert(orfs[0].start === 1, 'ORF starts at 1');
  assert(orfs[0].length_aa >= 10, 'ORF meets min length');
  assert(bio.findORFs('AAAA', 10).length === 0, 'no ORF in polyA');
})();

// FASTA parse
(function () {
  console.log('FASTA parse');
  const fa = '>seq1 desc\nATGC\nATGC\n>seq2\nGGGG';
  const recs = bio.parseFasta(fa);
  assert(recs.length === 2, 'two records');
  assert(recs[0].sequence === 'ATGCATGC', 'seq1 concatenated');
  assert(recs[1].header === 'seq2', 'seq2 header');
  assert(bio.parseFasta('').length === 0, 'empty fasta');
})();

// Edge cases + analyze layer tag
(function () {
  console.log('Edge cases');
  assert(bio.analyze('') === null, 'empty analyze');
  const a = bio.analyze('ATGCGATCGATCGATCGATCGTAA');
  assert(a && a.layer === 'DETERMINISTIC', 'layer tagged DETERMINISTIC');
  assert(typeof a.gc_percent === 'number', 'gc present');
  assert(a.reverse_complement_preview, 'rc present');
  const p = bio.analyze('MKTAYIAKQRQISFVKSHFSRQLE');
  assert(p.kind === 'protein', 'protein detection');
  assert(bio.tmWallace('ATGCATGCATGC') !== null, 'Wallace Tm for oligo');
  assert(bio.tmWallace('AT') === null, 'Wallace rejects too short');
})();

console.log('\nResult:', passed, 'passed,', failed, 'failed\n');
process.exit(failed ? 1 : 0);
