import { fileURLToPath, URL } from 'node:url';
import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { env } from 'node:process';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
    ? env.ASPNETCORE_URLS.split(';')[0]
    : 'https://localhost:7237';

function getDevHttpsConfig() {
  // CI/Vercel should never try to generate local ASP.NET dev certificates.
  if (env.CI === 'true' || env.VERCEL === '1') {
    return undefined;
  }

  const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
      ? `${env.APPDATA}/ASP.NET/https`
      : `${env.HOME}/.aspnet/https`;

  const certificateName = 'aethera.client';
  const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
  const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

  if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
  }

  if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    const result = childProcess.spawnSync(
      'dotnet',
      [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
      ],
      { stdio: 'inherit' },
    );

    if (result.status !== 0) {
      console.warn('Could not create ASP.NET HTTPS certificate. Falling back to HTTP dev server.');
      return undefined;
    }
  }

  return {
    key: fs.readFileSync(keyFilePath),
    cert: fs.readFileSync(certFilePath),
  };
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '^/weatherforecast': {
        target,
        secure: false,
      },
    },
    port: parseInt(env.DEV_SERVER_PORT || '62905', 10),
    https: command === 'serve' ? getDevHttpsConfig() : undefined,
  },
}));
