import sha256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

export async function calculateImageHash(data: ArrayBuffer): Promise<string> {
  const wordArray = Hex.parse(
    Array.from(new Uint8Array(data))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
  return sha256(wordArray).toString();
}