## 1. SignUp Error
    {
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed",
        "details": [
            {
                "field": "name",
                "message": "Invalid input: expected string, received undefined"
            },
            {
                "field": "termsAccepted",
                "message": "Invalid input: expected boolean, received undefined"
            }
        ]
    }
}

---

## 2. S3 pre-signed PUT — `SignatureDoesNotMatch` (Phase 4, 2026-06-23)

**Symptom:** A browser/`fetch` PUT to a pre-signed upload URL returned `403 SignatureDoesNotMatch`. The canonical request showed `X-Amz-Checksum-Crc32=AAAAAA%3D%3D` and `x-amz-sdk-checksum-algorithm=CRC32` in the signed query string.

**Cause:** Recent `@aws-sdk/client-s3` versions enable flexible checksums by default (`requestChecksumCalculation: 'WHEN_SUPPORTED'`), baking a CRC32 value into the signed URL at signing time. When the client streams the real file body, the checksum no longer matches and S3 rejects the signature.

**Fix:** Create the `S3Client` with `requestChecksumCalculation: 'WHEN_REQUIRED'` and `responseChecksumValidation: 'WHEN_REQUIRED'` (`server/src/lib/s3.ts`). See D72.

---

## 3. S3 PUT — `AccessDenied: not authorized to perform: s3:PutObject` (Phase 4, 2026-06-23)

**Symptom:** After fixing the signature, the PUT returned `403 AccessDenied` — IAM user authorized for no S3 action.

**Cause:** The IAM user existed but had no identity-based policy granting object actions.

**Fix:** Attach an inline policy allowing `s3:PutObject`/`s3:GetObject`/`s3:DeleteObject` on `arn:aws:s3:::<bucket>/*` (no `ListBucket` — least privilege). See D72(e).

---

## 4. Newman — `Identifier 'data' has already been declared` (Phase 4, 2026-06-23)

**Symptom:** A Postman test script using `const data = pm.response.json().data;` threw a `SyntaxError` under Newman, which cascaded into later assertions (the captured `s3Key` was never set).

**Cause:** `data` is a reserved global in the Postman/Newman sandbox (the data-file variable). Re-declaring it with `const` is a collision.

**Fix:** Rename the local variable (used `const res = ...`) in the test script.

**Note:** Re-running the full Newman suite against a long-lived server eventually trips the `upload-url` 7/hr rate limit (in-memory counter persists across runs). Restart the server to reset the counter between full re-runs.