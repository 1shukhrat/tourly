<h1>Tourist package purchase service</h1>

To run locally:

- Clone the repository:
  
	```sh
	git clone https://github.com/1shukhrat/tourly.git
- Rename file .env.origin to .env and fill in the fields

	| Plugin | README |
	| ------ | ------ |
	| DB_HOST | Mongo database host |
	| DB_PORT | Mongo database port |
	| DB_NAME | Mongo database name |
	| SERVER_PORT | Application port |
	| JWT_SECRET | JWT Secret for authentication |
	| JWT_EXPIRATION_TIME | JWT lifetime |

- Install the required dependencies using the command:

  ```sh
  npm install

- Start the program using the command:
  ```sh
  npm start
