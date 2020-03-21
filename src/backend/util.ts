export function generateId(len: number = 16, salt?: number): string {
    if (len > 8) return generateId(8, salt) + generateId(len - 8);

    const num = salt === undefined
        ? Math.floor(Math.random() * (36 ** len))
        : Math.floor(Math.random() * (36 ** (len - 4))) * (36 ** 4) + salt;

    let id = num.toString(36);
    if (id.length < len) {
        id = '0'.repeat(len - id.length) + id;
    }
    return id;
}
