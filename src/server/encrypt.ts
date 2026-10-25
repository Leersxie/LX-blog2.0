import {
	createCipheriv,
	randomBytes,
	pbkdf2Sync,
} from "node:crypto";

import type { EncryptedPayload } from "../types";

const ITERATIONS = 240_000;

/**
 * Server-side encryption for the static build. The client receives only the
 * envelope. The passphrase must come from a build secret, never frontmatter.
 */
export function encryptHtml(
	html: string,
	passphrase: string,
): EncryptedPayload {
	const salt = randomBytes(16);
	const iv = randomBytes(12);
	const key = pbkdf2Sync(passphrase, salt, ITERATIONS, 32, "sha256");
	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const ciphertext = Buffer.concat([
		cipher.update(html, "utf8"),
		cipher.final(),
	]);
	return {
		v: 1,
		alg: "AES-256-GCM",
		iter: ITERATIONS,
		salt: salt.toString("base64"),
		iv: iv.toString("base64"),
		ct: ciphertext.toString("base64"),
		tag: cipher.getAuthTag().toString("base64"),
	};
}
