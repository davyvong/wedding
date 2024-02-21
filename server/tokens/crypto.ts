class CryptoToken {
  private static readonly signingKey = crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(process.env.TOKEN_SIGNING_KEY),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign'],
  );

  private static toHex(arrayBuffer: ArrayBuffer): string {
    return Array.prototype.map.call(new Uint8Array(arrayBuffer), n => n.toString(16).padStart(2, '0')).join('');
  }

  public static async sign(payload: unknown): Promise<string> {
    const signature = await crypto.subtle.sign(
      'HMAC',
      await CryptoToken.signingKey,
      new TextEncoder().encode(JSON.stringify(payload)),
    );
    return CryptoToken.toHex(signature);
  }

  public static async verify(token: string, payload: unknown): Promise<boolean> {
    const signedToken = await CryptoToken.sign(payload);
    return token === signedToken;
  }
}

export default CryptoToken;
