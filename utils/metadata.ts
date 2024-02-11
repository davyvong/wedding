import Translate from 'client/translate';
import { Metadata } from 'next';
import ServerEnvironment from 'server/environment';

interface MetadataOptions {
  url?: string;
}

export const generateMetadata = (options: MetadataOptions = {}): Metadata => ({
  description: Translate.t('app.metadata.description'),
  openGraph: {
    description: Translate.t('app.metadata.description'),
    images: './opengraph-image.jpg',
    title: Translate.t('app.metadata.title'),
    url: options.url,
  },
  metadataBase: new URL(ServerEnvironment.getBaseURL()),
  title: Translate.t('app.metadata.title'),
  twitter: {
    card: 'summary_large_image',
    description: Translate.t('app.metadata.description'),
    images: './opengraph-image.jpg',
    title: Translate.t('app.metadata.title'),
  },
});
