// Static ZIP fixtures cover normal files, valid internal links and both traversal attacks.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const extract = require(process.argv[2]);
const fixtures = {"normal": "UEsDBBQAAAAAAAAAIQCPKKQfBAAAAAQAAAAIAAAAZmlsZS50eHRzYWZlUEsBAhQDFAAAAAAAAAAhAI8opB8EAAAABAAAAAgAAAAAAAAAAAAAAKSBAAAAAGZpbGUudHh0UEsFBgAAAAABAAEANgAAACoAAAAAAA==", "outside": "UEsDBBQAAAAAAAAAIQDGnafXDgAAAA4AAAAEAAAAbGluay4uL291dHNpZGUudHh0UEsBAhQDFAAAAAAAAAAhAMadp9cOAAAADgAAAAQAAAAAAAAAAAAAAP+hAAAAAGxpbmtQSwUGAAAAAAEAAQAyAAAAMAAAAAAA", "internal": "UEsDBBQAAAAAAAAAIQCPKKQfBAAAAAQAAAAIAAAAZmlsZS50eHRzYWZlUEsDBBQAAAAAAAAAIQAlFvfgCAAAAAgAAAAEAAAAbGlua2ZpbGUudHh0UEsBAhQDFAAAAAAAAAAhAI8opB8EAAAABAAAAAgAAAAAAAAAAAAAAKSBAAAAAGZpbGUudHh0UEsBAhQDFAAAAAAAAAAhACUW9+AIAAAACAAAAAQAAAAAAAAAAAAAAP+hKgAAAGxpbmtQSwUGAAAAAAIAAgBoAAAAVAAAAAAA", "duplicate": "UEsDBBQAAAAAAAAAIQAlFvfgCAAAAAgAAAAEAAAAbGlua2ZpbGUudHh0UEsDBBQAAAAAAAAAIQBiB19VCwAAAAsAAAAEAAAAbGlua292ZXJ3cml0dGVuUEsBAhQDFAAAAAAAAAAhACUW9+AIAAAACAAAAAQAAAAAAAAAAAAAAP+hAAAAAGxpbmtQSwECFAMUAAAAAAAAACEAYgdfVQsAAAALAAAABAAAAAAAAAAAAAAApIEqAAAAbGlua1BLBQYAAAAAAgACAGQAAABXAAAAAAA="};
(async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'zip-security-'));
  try {
    const outside = path.join(root, 'outside.txt');
    await fs.writeFile(outside, 'unchanged');
    for (const name of Object.keys(fixtures)) {
      const archive = path.join(root, name + '.zip');
      const dest = path.join(root, name);
      await fs.writeFile(archive, Buffer.from(fixtures[name], 'base64'));
      if (name === 'outside' || name === 'duplicate') await assert.rejects(extract(archive, { dir: dest }));
      else {
        await extract(archive, { dir: dest });
        assert.equal(await fs.readFile(path.join(dest, 'file.txt'), 'utf8'), 'safe');
        if (name === 'internal') assert.equal(await fs.readFile(path.join(dest, 'link'), 'utf8'), 'safe');
      }
    }
    await assert.rejects(fs.stat(path.join(root, 'duplicate', 'file.txt')), { code: 'ENOENT' });
    assert.equal(await fs.readFile(outside, 'utf8'), 'unchanged');
    const dest = path.join(root, 'preexisting');
    await fs.mkdir(dest);
    await fs.symlink(outside, path.join(dest, 'file.txt'));
    await assert.rejects(extract(path.join(root, 'normal.zip'), { dir: dest }));
    assert.equal(await fs.readFile(outside, 'utf8'), 'unchanged');
  } finally { await fs.rm(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
