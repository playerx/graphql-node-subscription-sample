import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'graphql-subscriptions';
import * as faker from 'faker';

const channels: any[] = [];
let lastChannelId = 0;
let lastMessageId = 0;
let messageCreatedAt = 123456789;

function addChannel(name: any) {
	lastChannelId++;
	const newChannel = {
		id: String(lastChannelId),
		name: name,
		messages: [],
	};
	channels.push(newChannel);
	return lastChannelId;
}

function getChannel(id: any) {
	return channels.filter(channel => channel.id === id)[0];
}

function addFakeMessage(channel: any, messageText: any) {
	lastMessageId++;
	messageCreatedAt++;
	const newMessage = {
		id: lastMessageId,
		createdAt: messageCreatedAt,
		text: messageText,
	};
	channel.messages.push(newMessage);
}

// use faker to generate random messages in faker channel
addChannel('faker');
const fakerChannel = channels.filter(channel => channel.name === 'faker')[0];

// Add seed for consistent random data
faker.seed(9);
for (let i = 0; i < 50; i++) {
	addFakeMessage(fakerChannel, faker.random.words());
}

// generate second channel for initial channel list view
addChannel('channel2');

const pubsub = new PubSub();

export const resolvers = {
	Query: {
		channels: () => {
			return channels;
		},

		test: () => {
			return new Promise<any>(resolve => setTimeout(x => {
				console.log('aaaa')
				resolve({
					info: "tesst data",
				});
			}, 1000));
		},

		channel: (root: any, { id }: any) => {
			return getChannel(id);
		},
	},
	Channel: {
		name: () => {
			return new Promise<any>(resolve => setTimeout(x => {
				resolve('EZEKI');
			}, 3000));
		},
		messages: () => {
			return [{
				id: 1,
				text: 'String',
				createdAt: Date.now
			}];
		}
	},
	Mutation: {
		addChannel: (root: any, args: any) => {
			const name = args.name;
			const id = addChannel(name);
			return getChannel(id);
		},
		addMessage: (root: any, { message }: any) => {
			const channel = channels.filter(
				channel => channel.id === message.channelId
			)[0];
			if (!channel) throw new Error('Channel does not exist');

			const newMessage = {
				id: String(lastMessageId++),
				text: message.text,
				createdAt: +new Date(),
			};
			channel.messages.push(newMessage);

			pubsub.publish('messageAdded', {
				messageAdded: newMessage,
				channelId: message.channelId,
			});

			return newMessage;
		},
	},
	Subscription: {
		messageAdded: {
			subscribe: withFilter(
				() => pubsub.asyncIterator('messageAdded'),
				(payload, variables) => {
					// The `messageAdded` channel includes events for all channels, so we filter to only
					// pass through events for the channel specified in the query
					return payload.channelId === variables.channelId;
				}
			),
		},
	},
};
