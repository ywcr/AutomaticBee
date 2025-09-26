/**
 * 签名工具类
 * 用于生成API请求的签名
 */

const crypto = require('crypto');

class SignatureUtils {
    /**
     * 生成HMAC-SHA256签名
     * @param {string} key - 签名密钥
     * @param {string} data - 待签名数据
     * @returns {string} 签名结果
     */
    static generateHmacSha256(key, data) {
        return crypto.createHmac('sha256', key).update(data).digest('hex');
    }

    /**
     * 生成MD5哈希
     * @param {string} data - 待哈希数据
     * @returns {string} MD5哈希结果
     */
    static generateMd5(data) {
        return crypto.createHash('md5').update(data).digest('hex');
    }

    /**
     * 生成SHA256哈希
     * @param {string} data - 待哈希数据
     * @returns {string} SHA256哈希结果
     */
    static generateSha256(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * 根据知柏问卷的签名规则生成签名
     * @param {URLSearchParams} formData - 表单数据
     * @param {string} salt - 盐值
     * @returns {string} 签名结果
     */
    static generateQuestionnaireSignature(formData, salt) {
        try {
            // 获取所有参数并排序
            const params = {};
            for (const [key, value] of formData.entries()) {
                if (key !== 'sign' && key !== 'signkey') {
                    params[key] = value;
                }
            }

            // 按键名排序
            const sortedKeys = Object.keys(params).sort();
            
            // 构建签名字符串
            const signString = sortedKeys
                .map(key => `${key}=${params[key]}`)
                .join('&');

            // 添加盐值
            const finalString = signString + '&salt=' + salt;

            // 生成签名
            return this.generateMd5(finalString);
        } catch (error) {
            console.error('生成签名失败:', error);
            return '';
        }
    }

    /**
     * 验证签名
     * @param {URLSearchParams} formData - 表单数据
     * @param {string} salt - 盐值
     * @param {string} expectedSign - 期望的签名
     * @returns {boolean} 验证结果
     */
    static verifySignature(formData, salt, expectedSign) {
        const actualSign = this.generateQuestionnaireSignature(formData, salt);
        return actualSign === expectedSign;
    }

    /**
     * 为表单数据添加签名
     * @param {URLSearchParams} formData - 表单数据
     * @param {string} salt - 盐值
     */
    static addSignatureToFormData(formData, salt) {
        if (!salt) {
            console.warn('盐值为空，跳过签名生成');
            return;
        }

        const signature = this.generateQuestionnaireSignature(formData, salt);
        if (signature) {
            formData.set('sign', signature);
            formData.set('signkey', salt);
        }
    }
}

module.exports = SignatureUtils;
