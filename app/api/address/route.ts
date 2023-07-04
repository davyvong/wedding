import { NextRequest, NextResponse } from 'next/server';
import { object, string } from 'yup';

export interface CanadaPostSearchResult {
  Description: string;
  Highlight: string;
  Id: string;
  Text: string;
  Type: string;
}

export const GET = async (request: NextRequest): Promise<Response> => {
  const requestURL = new URL(request.url);
  const params = {
    lookup: requestURL.searchParams.get('lookup'),
  };
  const paramsSchema = object({
    lookup: string().min(1).required(),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  const url = new URL('https://ws1.postescanada-canadapost.ca/Capture/Interactive/Find/v1.00/json3ex.ws');
  url.searchParams.set('Key', 'EA98-JC42-TF94-JK98');
  url.searchParams.set('Limit', '7');
  url.searchParams.set('Text', params.lookup);
  const response = await fetch(url, {
    headers: {
      Origin: 'https://www.canadapost-postescanada.ca',
      Referer: 'https://www.canadapost-postescanada.ca/',
    },
  });
  const responseJson = await response.json();
  const addresses = responseJson.Items.filter((result: CanadaPostSearchResult): boolean => {
    return Boolean(result.Text) && result.Type === 'Address';
  })
    .map((result: CanadaPostSearchResult): string => {
      if (result.Description && result.Text) {
        return result.Text + ' ' + result.Description;
      }
      if (result.Text) {
        return result.Text;
      }
      if (result.Description) {
        return result.Description;
      }
      return '';
    })
    .filter(Boolean);
  return NextResponse.json(addresses, {
    headers: { 'Cache-Control': 's-maxage=604800, stale-while-revalidate=86400' },
  });
};
