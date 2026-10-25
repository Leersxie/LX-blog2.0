import { describe, expect, it } from "vitest";

import { decryptPayload } from "../src/lib/encryption";
import { encryptHtml } from "../src/server/encrypt";

describe("article encryption envelope", () => {
	it("decrypts only with the right passphrase", async () => {
		const html = "<h2>只属于密码后的内容</h2><p>差序格局</p>";
		const payload = encryptHtml(html, "correct horse battery staple");
		await expect(
			decryptPayload(payload, "correct horse battery staple"),
		).resolves.toBe(html);
		await expect(decryptPayload(payload, "wrong")).rejects.toBeTruthy();
	});

	it("does not expose plaintext in the serialized envelope", () => {
		const html = "<p>一段不该出现在页面源码里的正文</p>";
		const payload = encryptHtml(html, "secret");
		const serialized = JSON.stringify(payload);
		expect(serialized).not.toContain("不该出现");
		expect(payload.tag.length).toBeGreaterThan(0);
		expect(payload.iter).toBeGreaterThan(100_000);
	});
});
