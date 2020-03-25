import express from 'express';

import db from '../../models';

export const UsersRouter = (logger) => {
  const router = express.Router();
  router.use(logger);

  router.get('/', async (_req, res) => {
    const users = await db.User.findAll();
    res.json(users);
  });

  router.post('/', async (req, res) => {
    const { body } = req;
    const newUser = await db.User.create(body);
    // const [err, data] = await configWriter.write();
    // if (err) {
    //   return res.status(422).json({ errors: err });
    // }
    res.status(201).json(newUser);
  });

  return router;
}
