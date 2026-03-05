export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hash bcrypt
  roles: string[]; // ['admin'] | ['editor'] | ['viewer'] | ['admin','editor']
}
