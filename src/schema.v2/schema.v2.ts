import {
	graphql,
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString
} from 'graphql';


export const schema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: 'RootQueryType',
		fields: {
			test: {
				type: GraphQLString,
				resolve() {
					return new Promise<any>(resolve => {
						setTimeout(x => resolve(123), 3000);
					});
				}
			},
			hello: {
				type: GraphQLString,
				resolve() {
					return 'world';
				}
			}
		},
	})
});
