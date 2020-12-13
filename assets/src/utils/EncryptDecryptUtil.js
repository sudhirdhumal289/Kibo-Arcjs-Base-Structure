const crypto = require('crypto');

const algorithmToUs = 'aes-256-cbc';

class EncryptDecryptUtil {
  /**
   * Encrypt data using randomly generated iv & generated key.
   *
   * @param dataToEncrypt Data to be encrypted.
   * @returns {{metadata: {iv: string, key: string}, encryptedData: string} Object containing encrypted data and
   *          generated key and generated iv used to encrypt data.
   */
  encrypt(dataToEncrypt) {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // eslint-disable-next-line node/no-deprecated-api
    const cipher = crypto.createCipheriv(algorithmToUs, new Buffer(key), iv); // NOSONAR

    let encrypted = cipher.update(dataToEncrypt);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      metadata: {
        key: key.toString('hex'),
        iv: iv.toString('hex'),
      },
      encryptedData: encrypted.toString('hex'),
    };
  }

  /**
   * Decrypt the data passed using provided key and iv.
   *
   * @param encryptedData Already encrypted data.
   * @param key Key which will be used to decrypt the data.
   * @param iv IV which will be used to decrypt the data.
   * @returns {Buffer} Buffer containing the data in decrypted form.
   */
  decrypt(encryptedData, key, iv) {
    // eslint-disable-next-line node/no-deprecated-api
    const rawIv = new Buffer(iv, 'hex');
    // eslint-disable-next-line node/no-deprecated-api
    const rawKey = new Buffer(key, 'hex');
    // eslint-disable-next-line node/no-deprecated-api
    const rawEncryptedData = new Buffer(encryptedData, 'hex');

    const decipher = crypto.createDecipheriv(algorithmToUs, rawKey, rawIv); // NOSONAR

    let decrypted = decipher.update(rawEncryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }
}

module.exports = EncryptDecryptUtil;
