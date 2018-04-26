import fetchPonyfill from 'fetch-ponyfill';

const { fetch, Headers, Response } = fetchPonyfill();

export { fetch, Headers, Response };
