import { faker } from '@faker-js/faker';

export class TestDataUtils {
  // Generate a unique random name using faker.js and a unique test identifier
  public static generateRandomName(): string {
    const randomFirstName = faker.person.firstName();
    const randomLastName = faker.person.lastName();

    return `${randomFirstName} ${randomLastName}`;
  }

  public static generateRandomCity(): string {
    const city = faker.location.city();
    return `${city}`;
  }

  public static generateRandomZip(): string {
    const zip = faker.location.zipCode();
    return `${zip}`;
  }

  public static generateRandomState(): string {
    const state = faker.location.state({ abbreviated: true });
    return `${state}`;
  }

  public static generateRandomAddress(): string {
    const streetAddress = faker.location.streetAddress();
    return `${streetAddress}`;
  }
}
