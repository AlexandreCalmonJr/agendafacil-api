const bcrypt = require('bcryptjs');

async function test() {
  const hash = '$2a$10$8K1p/a8RBQH6.FQzJ8H0OeJYpB3jVbKxFwWqvoEgP2pMK0QYlDHy6';
  const result = await bcrypt.compare('123456', hash);
  console.log('Match: ', result);

  const realHash = await bcrypt.hash('123456', 10);
  console.log('New hash for 123456: ', realHash);
}

test();
