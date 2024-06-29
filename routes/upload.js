const express = require('express');
const multiparty = require('multiparty');
const fs = require('fs');
const mime = require('mime-types');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const form = new multiparty.Form();
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });
        console.log('length: ', files.file.length);
        const client = new S3Client({
            region: 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        const links = [];
        for (const file of files.file) {
            const ext = file.originalFilename.split('.').pop();
            const newFilename = Date.now() + '.' + ext;
            // console.log({ ext, file });

            await client.send(new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: newFilename,
                Body: fs.readFileSync(file.path),
                ACL: 'public-read',
                ContentType: mime.lookup(file.path),
            }));

            const link = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${newFilename}`;
            links.push(link);
        }

        res.json({ links });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/', async (req, res) => {
    try {
        const { filename } = req.query;

        const client = new S3Client({
            region: 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        const data = await client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
        }));

        console.log('Success. Object deleted.', data);
        console.log('File deleted successfully');
        res.json(data);
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

module.exports = router;