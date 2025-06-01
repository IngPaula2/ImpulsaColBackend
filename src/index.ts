import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { ServerBootstrap } from './infrastructure/bootstrap/ServerBootstrap';

const app = express();
const server = new ServerBootstrap(app);

server.init()
    .then(() => {
        console.log('Server initialized successfully');
    })
    .catch((error) => {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    });
