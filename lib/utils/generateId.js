// Generates a URL-safe id using a fixed alphabet. Default length is 12, which
// matches the trainee_interviews.id column.
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateId(length = 12) {
    let out = "";
    for (let i = 0; i < length; i++) {
        out += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return out;
}
