import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET /api/ping -> For ping/jitter testing
  app.get('/api/ping', (req, res) => {
    res.status(200).send('pong');
  });

  // GET /api/download -> Streams dummy data for download test
  app.get('/api/download', (req, res) => {
    // Determine size to send from query, default 10MB
    const sizeMB = Number(req.query.size) || 10;
    const totalBytes = sizeMB * 1024 * 1024;
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', totalBytes.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    const chunkSize = 64 * 1024; // 64KB chunks
    const chunk = crypto.randomBytes(chunkSize);
    let bytesSent = 0;

    const streamData = () => {
      let canWrite = true;
      while (bytesSent < totalBytes && canWrite) {
        const bytesToWrite = Math.min(chunkSize, totalBytes - bytesSent);
        canWrite = res.write(bytesToWrite === chunkSize ? chunk : chunk.subarray(0, bytesToWrite));
        bytesSent += bytesToWrite;
      }
      
      if (bytesSent < totalBytes) {
        res.once('drain', streamData);
      } else {
        res.end();
      }
    };
    
    streamData();
  });

  // POST /api/upload -> Accepts dummy data for upload test
  app.post('/api/upload', (req, res) => {
    let bytesReceived = 0;
    
    req.on('data', (chunk) => {
      bytesReceived += chunk.length;
    });
    
    req.on('end', () => {
      res.status(200).json({ success: true, bytesReceived });
    });
  });

  // Record speed test results
  app.post(api.speedtest.record.path, async (req, res) => {
    try {
      const input = api.speedtest.record.input.parse(req.body);
      const testResult = await storage.createSpeedTest(input);
      res.status(201).json(testResult);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.speedtest.history.path, async (req, res) => {
    const tests = await storage.getSpeedTests();
    res.json(tests);
  });

  return httpServer;
}
