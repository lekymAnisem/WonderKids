import { extractSvg, isChildSafeSvg, sanitizeSvg } from '../src/utils/svg';

const SAFE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#ffffff"/><circle cx="512" cy="512" r="200" fill="none" stroke="#000000" stroke-width="6"/><path d="M100 100 L900 900" fill="none" stroke="#000000"/></svg>';

describe('SVG safety utilities', () => {
  it('extracts an SVG document from fenced model output', () => {
    const raw = 'Here you go:\n```html\n' + SAFE_SVG + '\n```\nEnjoy!';
    expect(extractSvg(raw)).toBe(SAFE_SVG);
  });

  it('returns null when no SVG is present', () => {
    expect(extractSvg('I cannot draw that.')).toBeNull();
  });

  it('strips scripts, event handlers and external references', () => {
    const malicious =
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)" viewBox="0 0 10 10">' +
      '<script>fetch("http://evil.test")</script>' +
      '<a href="javascript:alert(2)"><circle cx="1" cy="1" r="1"/></a>' +
      '<image href="http://evil.test/x.png"/>' +
      '<foreignObject><div>hi</div></foreignObject>' +
      '<rect width="10" height="10" fill="url(http://evil.test)"/>' +
      '<path d="M0 0 L10 10" onclick="hack()"/>' +
      '</svg>';

    const sanitized = sanitizeSvg(malicious);

    expect(sanitized).not.toMatch(/<script/i);
    expect(sanitized).not.toMatch(/onload/i);
    expect(sanitized).not.toMatch(/onclick/i);
    expect(sanitized).not.toMatch(/href/i);
    expect(sanitized).not.toMatch(/foreignObject/i);
    expect(sanitized).not.toMatch(/<image/i);
    expect(sanitized).not.toMatch(/url\(/i);
    expect(isChildSafeSvg(sanitized)).toBe(true);
  });

  it('rejects SVG without drawing elements', () => {
    const empty = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>';
    expect(isChildSafeSvg(empty)).toBe(false);
  });
});
