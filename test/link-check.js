// Just for some manual sanity checking.

import got  from 'got';

import data from '../data/2024/worker/index-mapping.js';

let cntr = 0;

const rootURL = 'http://localhost:8080/';

const promises = [];

const baseURLSet = new Set();

for (const key in data)
{
   const value = data[key];
   const doc_url = value.doc_url;

   if (typeof doc_url !== 'string' || !doc_url.length)
   {
      console.log(`Missing URL for ${key}`);
   }

   const parts = doc_url.split('#')

   if (baseURLSet.has(parts[0])) { continue; }
   baseURLSet.add(parts[0]);

   const url = `${rootURL}${parts[0]}`;

   promises.push((async () =>
   {
      try
      {
         // HEAD method avoids downloading full content.
         const response = await got.head(url);
         return { key, url, status: response.statusCode };
      } catch (error)
      {
         return { key, url, status: 'Error' };
      }
   })());

   // cntr++;
   // if (cntr === 150) { break; }
}

const results = await Promise.allSettled(promises)


console.log(`Failures:`)
for (const result of results)
{
   if (result?.value?.status !== 200)
   {
      console.log(JSON.stringify(result.value));
   }
}

// console.log(JSON.stringify(results, null, 2));
