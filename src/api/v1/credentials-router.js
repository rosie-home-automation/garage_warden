import express from 'express';

import db from '../../models';

export const CredentialsRouter = (logger) => {
  const router = express.Router();
  router.use(logger);

  router.get('/', async (_req, res) => {
    const credentials = await db.Credential.findAll();
    res.json(credentials);
  });

  router.post('/', async (req, res) => {
    const { body } = req;
    const newCredential = await db.Credential.create(body);
    res.status(201).json(newCredential);
  });

  return router;
}
