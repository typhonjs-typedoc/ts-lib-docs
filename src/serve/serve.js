import polka      from 'polka';
import sirv       from 'sirv';

const root = './docs';
const port = '8080';

// Use Polka & sirv
polka().use(sirv(root)).listen(port, (err) =>
{
   if (err) { throw err; }
   console.log(`> Ready on localhost:${port}`);
});

