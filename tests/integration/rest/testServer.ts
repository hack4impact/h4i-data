import { createRestApp } from '../../../src/api/rest/server';
import { disconnectDB } from '../../../src/config/database';
import { env } from '../../../src/config/server';
import express from 'express';
import { Server } from 'http';

// Hold the server instance to close it after tests
export let server: Server;

let app: express.Application;

export const startTestServer = () => {
  app = createRestApp();
  server = app.listen(env.REST_PORT);
  return server;
};

export const closeTestServer = async () => {
  // Close the server and database connections
  server.close();
  await disconnectDB();
};
