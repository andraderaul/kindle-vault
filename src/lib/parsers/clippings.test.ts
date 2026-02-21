import * as assert from 'node:assert';
import { describe, it } from 'node:test';
import { parseClippings } from './clippings';

describe('parseClippings', () => {
  it('Caso 1 — highlight normal', () => {
    const raw = `Sapiens: A Brief History of Humankind (Yuval Noah Harari)
- Your Highlight on page 42 | Location 638-640 | Added on Sunday, January 5, 2025 8:32:14 PM

The ant cannot understand the universe.
==========`;
    const result = parseClippings(raw);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(
      result[0].bookTitle,
      'Sapiens: A Brief History of Humankind',
    );
    assert.strictEqual(result[0].author, 'Yuval Noah Harari');
    assert.strictEqual(
      result[0].text,
      'The ant cannot understand the universe.',
    );
    assert.strictEqual(result[0].location, 638);
  });

  it('Caso 2 — bookmark (deve ser ignorado)', () => {
    const raw = `Some Book (Author Name)
- Your Bookmark on page 10 | Location 150 | Added on Monday, January 6, 2025

==========`;
    const result = parseClippings(raw);
    assert.strictEqual(result.length, 0);
  });

  it('Caso 3 — note (deve ser ignorado)', () => {
    const raw = `Sapiens (Yuval Noah Harari)
- Your Note on Location 532 | Added on Wednesday, March 4, 2026

Explorar melhor o conceito de "realidades imaginadas".
==========`;
    const result = parseClippings(raw);
    assert.strictEqual(result.length, 0);
  });

  it('Caso 4 — limite de highlights do Kindle (deve ser ignorado)', () => {
    const raw = `Some Book (Author)
- Your Highlight on Location 100 | Added on Monday

<You have reached the maximum number of highlights allowed on this item.>
==========`;
    const result = parseClippings(raw);
    assert.strictEqual(result.length, 0);
  });

  it('Caso 5 — livro sem autor nos parênteses', () => {
    const raw = `Unknown Book Without Author
- Your Highlight on Location 1 | Added on Monday

Some highlight text here.
==========`;
    const result = parseClippings(raw);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].bookTitle, 'Unknown Book Without Author');
    assert.strictEqual(result[0].author, 'Desconhecido');
  });

  it('Caso 6 — arquivo com BOM (\\uFEFF)', () => {
    const raw =
      '\uFEFF' +
      `Sapiens (Yuval Noah Harari)
- Your Highlight on Location 100 | Added on Monday

Text with BOM.
==========`;
    const result = parseClippings(raw);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, 'Text with BOM.');
  });

  it('Caso 7 — location como range "638-640" → deve extrair 638', () => {
    const raw = `Book (Author)
- Your Highlight on Location 638-640 | Added on Monday

First number wins.
==========`;
    const result = parseClippings(raw);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].location, 638);
  });

  it('Caso 8 — múltiplas entradas do mesmo livro → agrupam corretamente', () => {
    const raw = `1984 (George Orwell)
- Your Highlight on Location 245-248 | Added on Monday

War is peace.
==========
1984 (George Orwell)
- Your Highlight on Location 300-302 | Added on Tuesday

Freedom is slavery.
==========`;
    const result = parseClippings(raw);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].bookTitle, '1984');
    assert.strictEqual(result[0].author, 'George Orwell');
    assert.strictEqual(result[0].text, 'War is peace.');
    assert.strictEqual(result[1].bookTitle, '1984');
    assert.strictEqual(result[1].text, 'Freedom is slavery.');
  });

  it('Caso 9 — texto com múltiplas linhas', () => {
    const raw = `Book (Author)
- Your Highlight on Location 1-3 | Added on Monday

Line one of the highlight.
Line two of the highlight.
Line three.
==========`;
    const result = parseClippings(raw);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(
      result[0].text,
      'Line one of the highlight. Line two of the highlight. Line three.',
    );
  });

  it('Caso 10 — arquivo vazio → retorna array vazio sem throw', () => {
    const result = parseClippings('');
    assert.strictEqual(Array.isArray(result), true);
    assert.strictEqual(result.length, 0);
  });
});
