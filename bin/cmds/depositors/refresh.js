
const ezmesure = require('../../..');

exports.command = 'refresh';
exports.desc = 'Refresh the depositors list';
exports.handler = function handler(argv) {
  const options = {};

  if (argv.u) { options.baseUrl = argv.u; }
  if (argv.token) { options.token = argv.token; }
  if (argv.timeout) { options.timeout = argv.timeout; }
  if (argv.insecure) { options.strictSSL = false; }

  ezmesure.depositors.refresh(options).then((res) => {
    let nbErrors  = 0;
    let nbUpdated = 0;
    let nbUntouched = 0;

    res.items.forEach((item) => {
      const name   = item.name || '...';
      const prefix = item.indexPrefix || 'none';
      const count  = item.indexCount || 0;
      const docName = item.docContactName || 'none';
      const techName = item.techContactName || 'none';

      if (item.error) {
        nbErrors += 1;
        console.error(`[Error] ${item.name} : ${item.error}`);
      } else {
        console.group(`[${name}]`);
        console.log(`Prefix: ${prefix}`);
        console.log(`Count: ${count}`);
        console.log(`Doc: ${docName}`);
        console.log(`Tech: ${techName}`);
        console.groupEnd();

        if (item.updated) {
          nbUpdated += 1;
        } else {
          nbUntouched += 1;
        }
      }
    });

    console.log(`\n${nbUpdated} updated, ${nbUntouched} untouched, ${nbErrors} errors`);
    process.exit(nbErrors ? 1 : 0);
  }).catch((err) => {
    console.error(err.statusCode === 401 ? 'Invalid token' : err.message);
    process.exit(1);
  });
};
