export function getIconForIssuer(issuer) {
    if (!issuer) return null;

    const normalized = issuer.toLowerCase().trim().replace(/\s+/g, '');

    return `/images/icons/${normalized}.png`;
}

export default { getIconForIssuer };
