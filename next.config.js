/* eslint-disable @typescript-eslint/no-var-requires */

const loaderUtils = require('loader-utils');
const path = require('path');

const getLocalIdent = (context, localIdentName, localName) => {
  let bufferStr = `filePath:${path
    .relative(context.rootContext, context.resourcePath)
    .replace(/\\+/g, '/')}#className:${localName}`;
  if (context.resourcePath.includes('next/font')) {
    const resourceQuery = JSON.parse(context.resourceQuery.substring(1));
    bufferStr += resourceQuery.variableName;
  }
  return loaderUtils
    .getHashDigest(Buffer.from(bufferStr), 'md4', 'base64', 8)
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/^(-?\d|--)/, '_$1');
};

/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    webpackBuildWorker: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'i.scdn.co',
        protocol: 'https',
      },
    ],
  },
  redirects: () => [
    {
      destination: '/api/secret/:code*',
      permanent: false,
      source: '/secret/:code*',
    },
    {
      destination: '/api/sign-out',
      permanent: false,
      source: '/sign-out',
    },
    {
      destination: '/api/unsubscribe/:token*',
      permanent: false,
      source: '/unsubscribe/:token*',
    },
  ],
  webpack: (config, { dev }) => {
    const rules = config.module.rules
      .find(rule => typeof rule.oneOf === 'object')
      .oneOf.filter(rule => Array.isArray(rule.use));
    if (!dev) {
      rules.forEach(rule => {
        rule.use.forEach(moduleLoader => {
          if (moduleLoader.loader?.includes('css-loader') && !moduleLoader.loader?.includes('postcss-loader')) {
            moduleLoader.options = {
              ...moduleLoader.options,
              modules: {
                ...moduleLoader.options.modules,
                getLocalIdent,
              },
            };
          }
        });
      });
    }
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    config.module.rules.push({
      test: /\.eml$/,
      use: 'raw-loader',
    });
    config.resolve.alias = {
      ...config.resolve.alias,
      handlebars: 'handlebars/dist/handlebars.js',
    };
    return config;
  },
};
