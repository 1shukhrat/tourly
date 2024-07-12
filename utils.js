const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const saveFile = (fileName, fileContent) => {
    const buffer = Buffer.from(fileContent, 'base64');
    const file = `${uuidv4()}${path.extname(fileName)}`;
    const filePath = path.join(process.env.IMAGE_SOURCE_PATH, file);
    fs.writeFileSync(filePath, buffer);
    return file;
}

const removeFile =  (fileName)  =>  {
    fs.unlinkSync(path.join(process.env.IMAGE_SOURCE_PATH, fileName));
}

const generateToken = (id, email, role, phone) => {
    return jwt.sign(
        { id, email, role, phone }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRATION_TIME }   
    );
};

module.exports = {
    saveFile,
    removeFile,
    generateToken
}