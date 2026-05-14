import jwt from "jsonwebtoken";

const secret = "diabetes_care_secure_secret_2026_@_99";
const payload = { id: "test", name: "Test", email: "test@test.com", role: "patient" };
const token = jwt.sign(payload, secret, { expiresIn: "1d" });

console.log("Token generated:", token);

try {
    const verified = jwt.verify(token, secret);
    console.log("Verified:", verified);
} catch (e) {
    console.error("Verification failed:", e);
}
