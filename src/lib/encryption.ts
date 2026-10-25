import type { EncryptedPayload } from "../types";

function fromBase64(value: string): ArrayBuffer {
	const binary = atob(value);
	const buffer = new ArrayBuffer(binary.length);
	const bytes = new Uint8Array(buffer);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return buffer;
}

/**
 * Client-side decryption. This is deliberately an explicit, user-triggered
 * operation; the article body is never present in the static HTML.
 */
export async function decryptPayload(
	payload: EncryptedPayload,
	passphrase: string,
): Promise<string> {
	if (!globalThis.crypto?.subtle) {
		throw new Error("当前浏览器不支持 Web Crypto，无法解锁。");
	}
	if (!passphrase) {
		throw new Error("请输入密码。");
	}
	if (payload.alg !== "AES-256-GCM" || payload.v !== 1) {
		throw new Error("无法识别的密文格式。");
	}

	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(passphrase),
		"PBKDF2",
		false,
		["deriveKey"],
	);
	const key = await crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: fromBase64(payload.salt),
			iterations: payload.iter,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["decrypt"],
	);

	const ciphertext = new Uint8Array(fromBase64(payload.ct));
	const tag = new Uint8Array(fromBase64(payload.tag));
	const combinedBuffer = new ArrayBuffer(ciphertext.length + tag.length);
	const combined = new Uint8Array(combinedBuffer);
	combined.set(ciphertext);
	combined.set(tag, ciphertext.length);

	const plaintext = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: fromBase64(payload.iv), tagLength: 128 },
		key,
		combinedBuffer,
	);
	return new TextDecoder().decode(plaintext);
}
