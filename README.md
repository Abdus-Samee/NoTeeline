# NoTeeline: Supporting Real-Time, Personalized Notetaking with LLM-Enhanced Micronotes

  

## Local Development
 - Clone the repo using the following command:
	`$ git clone https://github.com/oaishi/NoTeeline.git`
- If *npm* is the desired package manager, then just replace the command:
	- `yarn` with the command `npm install`
	- `yarn dev` with the command `npm run dev`

### Frontend
- `cd` into the folder **Frontend** Run `yarn` to install all the necessary packages
- While the current working directory is **Frontend**, run the command `yarn dev` to start the frontend

### Backend
- In order to start the server, `cd` into the **Backend** folder and run `yarn` to install all the necessary packages for the backend server
- While being in the **Backend** directory, run the command `node index.js` to start the server at port 3000

### Environment Variables
 - Create a file named `.env` under the folder **Frontend**
 - Locate the file `.env.example` under the same folder and copy its contents to the file `.env` created earlier
 - Add the OpenAI key in the mentioned space inside `.env`
