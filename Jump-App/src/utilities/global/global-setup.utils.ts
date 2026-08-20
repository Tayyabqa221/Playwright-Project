import { generateRandomId } from '@utilities/random.utils'


export default async function globalSetup() {
  process.env.TEST_SESSION_ID = generateRandomId();
}
