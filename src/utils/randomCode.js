/**
 * 随机码类型
 */
export const CodeType = {
    UPPER: 'UPPER', // 数字+大写字母
    LOWER: 'LOWER', // 数字+小写字母
    MIXED: 'MIXED'  // 数字+大小写字母
}

/**
 * 生成随机码
 *
 * @param {number} length 长度
 * @param {string} type 类型
 * @returns {string}
 */
export function generateCode(length = 8, type = CodeType.UPPER) {
    const charMap = {
        [CodeType.UPPER]: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        [CodeType.LOWER]: '0123456789abcdefghijklmnopqrstuvwxyz',
        [CodeType.MIXED]: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    }

    const chars = charMap[type]
    let result = ''

    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * chars.length)
        result += chars[index]
    }

    return result
}