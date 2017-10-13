import * as express from 'express';
import * as bodyParser from 'body-parser';
import { createServer } from 'http';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

import { schema } from './schema.v1/schema';

const myGraphQLSchema = schema;// ... define or import your schema here!
const PORT = 3000;

const app = express();

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema }));
app.get('/graphiql', graphiqlExpress({
	endpointURL: '/graphql',
	subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
})); // if you want GraphiQL enabled

const ws = createServer(app);

ws.listen(PORT, () => {
	console.log(`GraphQL Server is now running on http://localhost:${PORT}`);

	// Set up the WebSocket for handling GraphQL subscriptions
	new SubscriptionServer({
		execute,
		subscribe,
		schema
	}, { server: ws, path: '/subscriptions', });
});


